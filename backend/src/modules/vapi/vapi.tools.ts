import prisma from "../../config/db";
import { SchedulerService } from "../../queues/reminder.queue";

export interface ToolCallResult {
  toolCallId: string;
  result: Record<string, any> | string;
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
        return { toolCallId, result: { success: false, message: "Reminder not found" } };
      }

      const updated = await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Cancel any future scheduled retry jobs
      await SchedulerService.cancelPendingJobs(reminderId, reminder.maxAttempts);

      console.log(`✅ [Vapi Tools] Reminder "${updated.title}" marked as COMPLETED by voice assistant.`);
      return {
        toolCallId,
        result: {
          success: true,
          status: "COMPLETED",
          message: `Great job! I've marked "${updated.title}" as completed.`,
        },
      };
    } catch (error: any) {
      console.error("❌ [Vapi Tools] Error completing reminder:", error);
      return { toolCallId, result: { success: false, error: error.message } };
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
        return { toolCallId, result: { success: false, message: "Reminder not found" } };
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

      // Cancel prior pending retry jobs
      await SchedulerService.cancelPendingJobs(reminderId, reminder.maxAttempts);

      // Reset retry count on explicit user snooze so they get full retry attempts when due again
      const updated = await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: "SNOOZED",
          scheduledAt: snoozeDate,
          retryCount: 0,
        },
      });

      // Schedule new BullMQ job for the snoozed time
      await SchedulerService.scheduleReminder(reminderId, snoozeDate, 1);

      console.log(
        `⏰ [Vapi Tools] Reminder "${updated.title}" snoozed for ${minutes} minutes (due at ${snoozeDate.toISOString()}).`
      );

      return {
        toolCallId,
        result: {
          success: true,
          status: "SNOOZED",
          snoozedUntil: snoozeDate.toISOString(),
          message: `Sure thing! I will call you back in ${minutes} minutes.`,
        },
      };
    } catch (error: any) {
      console.error("❌ [Vapi Tools] Error snoozing reminder:", error);
      return { toolCallId, result: { success: false, error: error.message } };
    }
  }

  /**
   * Cancel reminder: User says "Cancel this reminder", "Drop it"
   */
  public static async cancelReminder(reminderId: string, toolCallId: string): Promise<ToolCallResult> {
    try {
      const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
      if (!reminder) {
        return { toolCallId, result: { success: false, message: "Reminder not found" } };
      }

      const updated = await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: "CANCELLED",
        },
      });

      // Cancel any future pending jobs
      await SchedulerService.cancelPendingJobs(reminderId, reminder.maxAttempts);

      console.log(`🚫 [Vapi Tools] Reminder "${updated.title}" CANCELLED by voice assistant.`);
      return {
        toolCallId,
        result: {
          success: true,
          status: "CANCELLED",
          message: `Understood. I have cancelled the reminder for "${updated.title}".`,
        },
      };
    } catch (error: any) {
      console.error("❌ [Vapi Tools] Error cancelling reminder:", error);
      return { toolCallId, result: { success: false, error: error.message } };
    }
  }

  /**
   * Get reminder info
   */
  public static async getReminder(reminderId: string, toolCallId: string): Promise<ToolCallResult> {
    try {
      const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
      if (!reminder) {
        return { toolCallId, result: { success: false, message: "Reminder not found" } };
      }

      return {
        toolCallId,
        result: {
          success: true,
          reminder: {
            id: reminder.id,
            title: reminder.title,
            description: reminder.description,
            priority: reminder.priority,
            scheduledAt: reminder.scheduledAt,
            status: reminder.status,
          },
        },
      };
    } catch (error: any) {
      return { toolCallId, result: { success: false, error: error.message } };
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
      const scheduledAt = new Date(Date.now() + delay * 60 * 1000);

      const reminder = await prisma.reminder.create({
        data: {
          userId,
          title: args.title,
          scheduledAt,
          priority: args.priority || "MEDIUM",
          status: "SCHEDULED",
        },
      });

      await SchedulerService.scheduleReminder(reminder.id, scheduledAt, 1);

      console.log(`✨ [Vapi Tools] Created in-call reminder "${reminder.title}" due in ${delay}m.`);

      return {
        toolCallId,
        result: {
          success: true,
          message: `Created reminder for "${reminder.title}" in ${delay} minutes.`,
          reminderId: reminder.id,
        },
      };
    } catch (error: any) {
      console.error("❌ [Vapi Tools] Error creating in-call reminder:", error);
      return { toolCallId, result: { success: false, error: error.message } };
    }
  }
}
