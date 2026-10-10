import prisma from "../../config/db";
import { ReminderRepository } from "./reminder.repository";
import { SchedulerService } from "../../queues/reminder.queue";

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
    retryPolicy?: {
      maxAttempts?: number;
      retryIntervalMinutes?: number;
    };
  }) {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        plan: true,
        maxReminders: true,
        timezone: true,
        preferredVoice: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Quota validation for trial accounts
    if (user.plan === "TRIAL") {
      const activeCount = await ReminderRepository.countActiveByUser(user.id);
      if (activeCount >= user.maxReminders) {
        throw new Error(
          `Trial limit reached (${user.maxReminders} active reminders). Please complete or delete existing reminders, or upgrade to Pro.`
        );
      }
    }

    const scheduledDate = new Date(params.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new Error("Invalid scheduled date format");
    }

    const maxAttempts = params.retryPolicy?.maxAttempts ?? 3;
    const retryIntervalMinutes = params.retryPolicy?.retryIntervalMinutes ?? 10;
    const timezone = params.timezone || user.timezone || "Asia/Kolkata";
    const voicePersona = params.voicePersona || user.preferredVoice || "Elena";

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
    });

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
        status: "MISSED",
      },
      orderBy: { updatedAt: "desc" },
      include: { attempts: true },
    });
  }

  /**
   * Update reminder properties
   */
  public static async updateReminder(id: string, userId: string, data: any) {
    const reminder = await ReminderRepository.findById(id, userId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }

    const updatePayload: any = { ...data };
    if (data.title) {
      updatePayload.task = data.title;
    }

    if (data.scheduledAt) {
      const newDate = new Date(data.scheduledAt);
      updatePayload.scheduledAt = newDate;

      // Reschedule BullMQ job if date changed and reminder is pending
      if (["SCHEDULED", "SNOOZED"].includes(reminder.status)) {
        await SchedulerService.startNewCycle(id, newDate);
      }
    }

    await ReminderRepository.update(id, userId, updatePayload);
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
    await ReminderRepository.delete(id, userId);
    return { success: true };
  }
}
