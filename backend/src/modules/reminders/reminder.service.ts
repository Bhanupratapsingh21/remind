import prisma from "../../config/db";
import { ReminderRepository } from "./reminder.repository";
import { SchedulerService } from "../../queues/reminder.queue";
import { resolveVoice } from "../vapi/voices";
import { PLAN_LIMITS, FREE_TEST_REMINDERS, isPaidPlan } from "../billing/plans";
import { isRepeatRule, nextOccurrence, repeatFieldsFor, type RepeatRule } from "../../utils/repeat.utils";
import { CONNECTED_CALL } from "../calls/call.constants";

/** A reminder set from the dashboard must be at least this far ahead (people pick "now" and expect a call) */
export const MIN_LEAD_MINUTES = 2;
const MIN_LEAD_MS = MIN_LEAD_MINUTES * 60_000 - 15_000; // 15s grace for form-filling and network time
const MAX_AHEAD_MS = 366 * 24 * 3600_000;

/** Statuses a reminder can be edited from (not while a call is live, not once finished) */
const EDITABLE_STATUSES = ["SCHEDULED", "SNOOZED", "MISSED", "FAILED", "ACKNOWLEDGED"];
const ACTIVE_STATUSES = ["SCHEDULED", "CALLING", "SNOOZED"];

/** A user-facing input problem (wrong time, can't edit now); answered with 400 */
export class ReminderInputError extends Error {
  public readonly code = "INVALID_INPUT";
}

function assertLeadTime(date: Date) {
  if (isNaN(date.getTime())) throw new ReminderInputError("Please pick a valid date and time.");
  if (date.getTime() < Date.now() + MIN_LEAD_MS) {
    throw new ReminderInputError(
      `That time is too soon or has already passed. Pick a time at least ${MIN_LEAD_MINUTES} minutes from now.`
    );
  }
  if (date.getTime() > Date.now() + MAX_AHEAD_MS) {
    throw new ReminderInputError("Pick a time within the next year.");
  }
}

function assertRepeatAllowed(plan: string, repeat: string | undefined | null) {
  if (repeat && repeat !== "NONE" && plan !== "PRO") {
    throw new PlanLimitError("Repeating reminders are part of Pro. Upgrade to set daily or weekly calls.");
  }
}

/** Thrown when the user's plan doesn't allow another reminder; the frontend opens the plan picker */
export class PlanLimitError extends Error {
  public readonly code = "PLAN_LIMIT";
}

/**
 * Give the free test call back when a free user cancels or deletes a reminder that never placed a call,
 * so a wrong time or a typo doesn't burn their only test. A reminder already CANCELLED was refunded then.
 */
async function refundFreeTestIfUnused(reminderId: string, userId: string, previousStatus: string) {
  if (previousStatus === "CANCELLED") return;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true, freeRemindersUsed: true } });
  if (!user || isPaidPlan(user.plan) || !user.freeRemindersUsed) return;
  // Only a call that actually connected uses up the test; a carrier failure or no answer does not
  const calls = await prisma.reminderAttempt.count({ where: { reminderId, ...CONNECTED_CALL } });
  if (calls > 0) return;
  await prisma.user.update({ where: { id: userId }, data: { freeRemindersUsed: Math.max(0, user.freeRemindersUsed - 1) } });
}

async function assertPlanAllows(user: { id: string; plan: string; freeRemindersUsed: number | null }) {
  if (user.plan === "PRO") return;

  if (user.plan === "BASIC") {
    const activeCount = await ReminderRepository.countActiveByUser(user.id);
    if (activeCount >= PLAN_LIMITS.BASIC) {
      throw new PlanLimitError(
        `Basic includes ${PLAN_LIMITS.BASIC} active reminders. Complete or delete one, or upgrade to Pro for unlimited.`
      );
    }
    return;
  }

  // Free (no subscription): one test reminder in total
  if ((user.freeRemindersUsed || 0) >= FREE_TEST_REMINDERS) {
    throw new PlanLimitError("You've used your free test call. Choose Basic or Pro to keep getting reminder calls.");
  }
}

export class ReminderService {
  /**
   * Create a new reminder and schedule its BullMQ job
   */
  public static async createReminder(params: {
    userId: string;
    title: string;
    description?: string;
    scheduledAt: string | Date;
    timezone?: string;
    priority?: string;
    notificationChannel?: string;
    voicePersona?: string;
    repeat?: string;
    retryPolicy?: {
      maxAttempts?: number;
      retryIntervalMinutes?: number;
    };
    /** Dashboard requests: enforce the minimum lead time (voice-created reminders pick their own delay) */
    enforceLeadTime?: boolean;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        plan: true,
        maxReminders: true,
        timezone: true,
        preferredVoice: true,
        freeRemindersUsed: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const scheduledDate = new Date(params.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new ReminderInputError("Please pick a valid date and time.");
    }
    if (params.enforceLeadTime) assertLeadTime(scheduledDate);
    assertRepeatAllowed(user.plan, params.repeat);

    await assertPlanAllows(user);

    const maxAttempts = params.retryPolicy?.maxAttempts ?? 3;
    const retryIntervalMinutes = params.retryPolicy?.retryIntervalMinutes ?? 10;
    const timezone = params.timezone || user.timezone || "Asia/Kolkata";
    const voicePersona = resolveVoice(params.voicePersona || user.preferredVoice);

    const reminder = await ReminderRepository.create({
      userId: user.id,
      title: params.title,
      description: params.description,
      scheduledAt: scheduledDate,
      timezone,
      priority: params.priority || "MEDIUM",
      notificationChannel: params.notificationChannel || "PHONE",
      voicePersona,
      maxAttempts,
      retryIntervalMinutes,
      ...(isRepeatRule(params.repeat) ? repeatFieldsFor(params.repeat, scheduledDate, timezone) : {}),
    });

    // The free plan's one test call is used up by creating it, even if the reminder is later deleted
    if (!isPaidPlan(user.plan)) {
      // Set, not { increment }: on MongoDB increment is a no-op while the field is missing (older users)
      await prisma.user.update({ where: { id: user.id }, data: { freeRemindersUsed: (user.freeRemindersUsed || 0) + 1 } });
    }

    // Schedule BullMQ job for when reminder is due
    await SchedulerService.startNewCycle(reminder.id, scheduledDate);

    return reminder;
  }

  /**
   * Get reminder by ID
   */
  public static async getReminderById(id: string, userId: string) {
    const reminder = await ReminderRepository.findById(id, userId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }
    return reminder;
  }

  /**
   * List reminders with various filters
   */
  public static async listReminders(userId: string, filter?: { date?: string; status?: string }) {
    if (filter?.date === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      return ReminderRepository.findMany({
        userId,
        status: filter.status,
        fromDate: startOfDay,
        toDate: endOfDay,
      });
    }

    return ReminderRepository.findMany({
      userId,
      status: filter?.status,
    });
  }

  /**
   * Get upcoming scheduled reminders
   */
  public static async getUpcoming(userId: string) {
    return prisma.reminder.findMany({
      where: {
        userId,
        deletedAt: { isSet: false },
        status: { in: ["SCHEDULED", "SNOOZED"] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      include: { attempts: true },
    });
  }

  /**
   * Get completed reminders
   */
  public static async getCompleted(userId: string) {
    return prisma.reminder.findMany({
      where: {
        userId,
        deletedAt: { isSet: false },
        status: "COMPLETED",
      },
      orderBy: { completedAt: "desc" },
      include: { attempts: true },
    });
  }

  /**
   * Get missed reminders
   */
  public static async getMissed(userId: string) {
    return prisma.reminder.findMany({
      where: {
        userId,
        deletedAt: { isSet: false },
        status: "MISSED",
      },
      orderBy: { updatedAt: "desc" },
      include: { attempts: true },
    });
  }

  /**
   * Edit a reminder. A new time restarts its call cycle; editing a missed or failed reminder with a new
   * time brings it back as scheduled (subject to plan limits).
   */
  public static async updateReminder(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      scheduledAt?: string | Date;
      priority?: string;
      voicePersona?: string;
      maxAttempts?: number;
      retryIntervalMinutes?: number;
      repeat?: string;
    }
  ) {
    const reminder = await ReminderRepository.findById(id, userId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }
    if (!EDITABLE_STATUSES.includes(reminder.status)) {
      throw new ReminderInputError(
        reminder.status === "CALLING"
          ? "This reminder is calling you right now. Edit it after the call."
          : "Finished reminders can't be edited. Create a new one instead."
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true, freeRemindersUsed: true },
    });
    if (!user) throw new Error("User not found");

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) {
      update.title = data.title;
      update.task = data.title;
    }
    if (data.description !== undefined) update.description = data.description || null;
    if (data.priority) update.priority = data.priority;
    if (data.voicePersona) update.voicePersona = resolveVoice(data.voicePersona);
    if (data.maxAttempts) update.maxAttempts = data.maxAttempts;
    if (data.retryIntervalMinutes) update.retryIntervalMinutes = data.retryIntervalMinutes;

    let newDate: Date | null = null;
    if (data.scheduledAt !== undefined) {
      newDate = new Date(data.scheduledAt);
      if (newDate.getTime() !== reminder.scheduledAt.getTime()) {
        assertLeadTime(newDate);
      } else {
        newDate = null; // unchanged
      }
    }

    // Repeat: Pro only; "NONE" switches it off. A new time also moves the repeat time.
    if (data.repeat !== undefined) {
      if (data.repeat === "NONE") {
        Object.assign(update, { repeat: null, repeatTime: null, repeatWeekday: null });
      } else if (isRepeatRule(data.repeat)) {
        assertRepeatAllowed(user.plan, data.repeat);
        Object.assign(update, repeatFieldsFor(data.repeat, newDate || reminder.scheduledAt, reminder.timezone));
      }
    } else if (newDate && isRepeatRule(reminder.repeat)) {
      Object.assign(update, repeatFieldsFor(reminder.repeat as RepeatRule, newDate, reminder.timezone));
    }

    const wasActive = ACTIVE_STATUSES.includes(reminder.status);
    if (newDate) {
      if (!wasActive) {
        // Coming back from MISSED / FAILED / ACKNOWLEDGED takes an active slot again
        if (!isPaidPlan(user.plan)) {
          const connected = await prisma.reminderAttempt.count({ where: { reminderId: id, ...CONNECTED_CALL } });
          if (connected > 0) {
            throw new PlanLimitError("Rescheduling after your free test call is part of Basic and Pro.");
          }
        } else if (user.plan === "BASIC") {
          const activeCount = await ReminderRepository.countActiveByUser(userId);
          if (activeCount >= PLAN_LIMITS.BASIC) {
            throw new PlanLimitError(
              `Basic includes ${PLAN_LIMITS.BASIC} active reminders. Complete or delete one, or upgrade to Pro for unlimited.`
            );
          }
        }
      }
      Object.assign(update, { scheduledAt: newDate, status: "SCHEDULED", retryCount: 0 });
    }

    await ReminderRepository.update(id, userId, update);
    if (newDate) await SchedulerService.startNewCycle(id, newDate);
    return ReminderRepository.findById(id, userId);
  }

  /**
   * Mark reminder as completed
   */
  public static async completeReminder(id: string, userId: string) {
    const reminder = await ReminderRepository.findById(id, userId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }

    await SchedulerService.cancelPendingJobs(id);

    await ReminderRepository.update(id, userId, {
      status: "COMPLETED",
      completedAt: new Date(),
    });
    await ReminderService.rollRepeat(id);

    return ReminderRepository.findById(id, userId);
  }

  /**
   * Snooze reminder
   */
  public static async snoozeReminder(
    id: string,
    userId: string,
    options: { minutes?: number; newScheduledAt?: string }
  ) {
    const reminder = await ReminderRepository.findById(id, userId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }

    let snoozeDate: Date;
    const minutes = options.minutes || 30;

    if (options.newScheduledAt) {
      const parsed = new Date(options.newScheduledAt);
      snoozeDate = !isNaN(parsed.getTime()) ? parsed : new Date(Date.now() + minutes * 60 * 1000);
    } else {
      snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
    }

    await ReminderRepository.update(id, userId, {
      status: "SNOOZED",
      scheduledAt: snoozeDate,
      retryCount: 0,
    });

    await SchedulerService.startNewCycle(id, snoozeDate);

    return ReminderRepository.findById(id, userId);
  }

  /**
   * Cancel reminder
   */
  public static async cancelReminder(id: string, userId: string) {
    const reminder = await ReminderRepository.findById(id, userId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }

    await SchedulerService.cancelPendingJobs(id);
    await refundFreeTestIfUnused(id, userId, reminder.status);

    await ReminderRepository.update(id, userId, {
      status: "CANCELLED",
    });

    return ReminderRepository.findById(id, userId);
  }

  /**
   * Delete reminder
   */
  public static async deleteReminder(id: string, userId: string) {
    const reminder = await ReminderRepository.findById(id, userId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }

    await SchedulerService.cancelPendingJobs(id);
    await refundFreeTestIfUnused(id, userId, reminder.status);
    // Soft delete: hidden everywhere, but its calls still count toward the daily cap and stay in the logs
    await ReminderRepository.update(id, userId, { status: "CANCELLED", deletedAt: new Date() });
    return { success: true };
  }

  /**
   * After an occurrence ends (done, missed, failed or talked through), move a repeating reminder to its
   * next occurrence and schedule it. Repeats are a Pro feature: on any other plan the repeat switches off.
   * Returns true when it rescheduled.
   */
  public static async rollRepeat(id: string): Promise<boolean> {
    const reminder = await prisma.reminder.findUnique({ where: { id }, include: { user: { select: { plan: true } } } });
    if (!reminder || !reminder.repeat || reminder.deletedAt || reminder.status === "CANCELLED") return false;

    if (reminder.user.plan !== "PRO") {
      await prisma.reminder.update({ where: { id }, data: { repeat: null, repeatTime: null, repeatWeekday: null } });
      console.log(`🔁 [Repeat] Reminder ${id}: plan is no longer Pro, repeat switched off`);
      return false;
    }

    // After the occurrence being closed, not just after now: "done" ahead of time must not re-ring today
    const after = new Date(Math.max(Date.now(), reminder.scheduledAt.getTime()));
    const next = nextOccurrence(reminder.repeat, reminder.repeatTime, reminder.repeatWeekday, reminder.timezone, after);
    if (!next) return false;

    await prisma.reminder.update({
      where: { id },
      data: { status: "SCHEDULED", scheduledAt: next, retryCount: 0 },
    });
    await SchedulerService.startNewCycle(id, next);
    console.log(`🔁 [Repeat] Reminder "${reminder.title}" next occurrence ${next.toISOString()}`);
    return true;
  }
}
