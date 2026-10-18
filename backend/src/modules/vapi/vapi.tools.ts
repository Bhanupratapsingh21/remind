import prisma from "../../config/db";
import { SchedulerService } from "../../queues/reminder.queue";
import { ReminderService } from "../reminders/reminder.service";

/**
 * Vapi tool result. Vapi reads `result` (or `error`) as a string and hands it to the model.
 */
export interface ToolCallResult {
  toolCallId: string;
  result?: string;
  error?: string;
}

export class VapiToolsService {
  /**
   * Complete reminder: User says "Done", "I finished it", "Completed"
   */
  public static async completeReminder(reminderId: string, toolCallId: string): Promise<ToolCallResult> {
    try {
      const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
      if (!reminder) {
        return { toolCallId, error: "Reminder not found." };
      }

      const updated = await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Cancel any future scheduled retry jobs
      await SchedulerService.cancelPendingJobs(reminderId);

      console.log(`✅ [Vapi Tools] Reminder "${updated.title}" marked as COMPLETED by voice assistant.`);
      return {
        toolCallId,
        result: `Marked "${updated.title}" as completed.`,
      };
    } catch (error: any) {
      console.error("❌ [Vapi Tools] Error completing reminder:", error);
      return { toolCallId, error: `Could not complete the reminder: ${error.message}` };
    }
  }

  /**
   * Snooze / Reschedule reminder: User says "Remind me in 30 minutes", "Call me back later"
   */
  public static async snoozeReminder(
    reminderId: string,
    args: { minutes?: number; newScheduledAt?: string },
    toolCallId: string
  ): Promise<ToolCallResult> {
    try {
      const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
      if (!reminder) {
        return { toolCallId, error: "Reminder not found." };
      }

      let snoozeDate: Date;
      let minutes = args.minutes || 30;

      if (args.newScheduledAt) {
        const parsed = new Date(args.newScheduledAt);
        if (!isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) {
          snoozeDate = parsed;
          minutes = Math.max(1, Math.round((snoozeDate.getTime() - Date.now()) / 60000));
        } else {
          snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
        }
      } else {
        snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
      }

      // Reset retry count on explicit user snooze so they get full retry attempts when due again
      const updated = await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: "SNOOZED",
          scheduledAt: snoozeDate,
          retryCount: 0,
        },
      });

      // Cancel prior pending retries and queue the callback as a new call
      await SchedulerService.startNewCycle(reminderId, snoozeDate);

      console.log(
        `⏰ [Vapi Tools] Reminder "${updated.title}" snoozed for ${minutes} minutes (due at ${snoozeDate.toISOString()}).`
      );

      return {
        toolCallId,
        result: `Snoozed. The next call is in ${minutes} minutes (at ${snoozeDate.toISOString()}).`,
      };
    } catch (error: any) {
      console.error("❌ [Vapi Tools] Error snoozing reminder:", error);
      return { toolCallId, error: `Could not snooze the reminder: ${error.message}` };
    }
  }

  /**
   * Cancel reminder: User says "Cancel this reminder", "Drop it"
   */
  public static async cancelReminder(reminderId: string, toolCallId: string): Promise<ToolCallResult> {
    try {
      const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
      if (!reminder) {
        return { toolCallId, error: "Reminder not found." };
      }

      const updated = await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: "CANCELLED",
        },
      });

      // Cancel any future pending jobs
      await SchedulerService.cancelPendingJobs(reminderId);

      console.log(`🚫 [Vapi Tools] Reminder "${updated.title}" CANCELLED by voice assistant.`);
      return {
        toolCallId,
        result: `Cancelled the reminder "${updated.title}".`,
      };
    } catch (error: any) {
      console.error("❌ [Vapi Tools] Error cancelling reminder:", error);
      return { toolCallId, error: `Could not cancel the reminder: ${error.message}` };
    }
  }

  /**
   * Get reminder info
   */
  public static async getReminder(reminderId: string, toolCallId: string): Promise<ToolCallResult> {
    try {
      const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
      if (!reminder) {
        return { toolCallId, error: "Reminder not found." };
      }

      return {
        toolCallId,
        result: JSON.stringify({
          title: reminder.title,
          description: reminder.description,
          priority: reminder.priority,
          scheduledAt: reminder.scheduledAt,
          status: reminder.status,
        }),
      };
    } catch (error: any) {
      return { toolCallId, error: `Could not load the reminder: ${error.message}` };
    }
  }

  /**
   * Create a new reminder dynamically during call
   */
  public static async createReminder(
    userId: string,
    args: { title: string; delayMinutes?: number; priority?: string },
    toolCallId: string
  ): Promise<ToolCallResult> {
    try {
      const delay = args.delayMinutes || 60;

      // Goes through ReminderService so trial limits and user defaults apply
      const reminder = await ReminderService.createReminder({
        userId,
        title: args.title,
        scheduledAt: new Date(Date.now() + delay * 60 * 1000),
        priority: args.priority || "MEDIUM",
      });

      console.log(`✨ [Vapi Tools] Created in-call reminder "${reminder.title}" due in ${delay}m.`);

      return {
        toolCallId,
        result: `Created a reminder for "${reminder.title}" in ${delay} minutes.`,
      };
    } catch (error: any) {
      console.error("❌ [Vapi Tools] Error creating in-call reminder:", error);
      return { toolCallId, error: `Could not create the reminder: ${error.message}` };
    }
  }
}
