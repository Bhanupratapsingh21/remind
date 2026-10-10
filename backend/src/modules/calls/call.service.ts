import prisma from "../../config/db";
import { VapiService } from "../vapi/vapi.service";
import { SchedulerService } from "../../queues/reminder.queue";

export class CallService {
  /**
   * Initiate an outbound call for a reminder attempt
   */
  public static async initiateOutboundCall(params: { reminderId: string; attemptNumber: number }) {
    const { reminderId, attemptNumber } = params;

    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: { user: true },
    });

    if (!reminder) {
      console.warn(`[CallService] Reminder ${reminderId} not found. Skipping call.`);
      return null;
    }

    // Stop if already completed or cancelled
    if (["COMPLETED", "CANCELLED"].includes(reminder.status)) {
      console.log(
        `[CallService] Reminder ${reminderId} is ${reminder.status}. Halting outbound call.`
      );
      return null;
    }

    const recipientPhone = reminder.user.phone;
    if (!recipientPhone) {
      console.error(`[CallService] User ${reminder.userId} has no registered phone number.`);
      await prisma.reminder.update({
        where: { id: reminderId },
        data: { status: "FAILED" },
      });
      return null;
    }

    // Idempotency: check if this attempt was already initiated
    let attempt = await prisma.reminderAttempt.findUnique({
      where: {
        reminderId_attemptNumber: {
          reminderId,
          attemptNumber,
        },
      },
    });

    if (attempt && attempt.status !== "FAILED") {
      console.warn(
        `[CallService] Attempt #${attemptNumber} for reminder ${reminderId} already exists (status: ${attempt.status}). Skipping duplicate call.`
      );
      return attempt;
    }

    // Create or reset attempt record
    if (!attempt) {
      attempt = await prisma.reminderAttempt.create({
        data: {
          reminderId,
          attemptNumber,
          channel: reminder.notificationChannel,
          status: "INITIATED",
          startedAt: new Date(),
        },
      });
    }

    // Mark reminder as CALLING
    await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: "CALLING",
        retryCount: attemptNumber,
      },
    });

    try {
      console.log(
        `📞 [CallService] Initiating call for reminder "${reminder.title}" to ${recipientPhone} (Attempt #${attemptNumber}/${reminder.maxAttempts})`
      );

      const vapiResponse = await VapiService.createOutboundCall({
        phoneNumber: recipientPhone,
        userName: reminder.user.name || "there",
        reminderId: reminder.id,
        title: reminder.title,
        description: reminder.description,
        priority: reminder.priority,
        attemptNumber,
      });

      // Update attempt with Vapi call ID
      const updatedAttempt = await prisma.reminderAttempt.update({
        where: { id: attempt.id },
        data: {
          vapiCallId: vapiResponse.id,
          status: "RINGING",
        },
      });

      return updatedAttempt;
    } catch (error: any) {
      console.error(`❌ [CallService] Call initiation failed for reminder ${reminderId}:`, error.message);

      await prisma.reminderAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          failureReason: error.message,
          endedAt: new Date(),
        },
      });

      // Schedule retry if attempts remaining
      if (attemptNumber < reminder.maxAttempts) {
        await SchedulerService.scheduleRetry(
          reminderId,
          reminder.retryIntervalMinutes,
          attemptNumber + 1
        );
      } else {
        await prisma.reminder.update({
          where: { id: reminderId },
          data: { status: "FAILED" },
        });
      }

      throw error;
    }
  }

  /**
   * Handle webhook end-of-call or status report
   */
  public static async handleCallCompletion(data: {
    vapiCallId: string;
    status: string; // "COMPLETED" | "NO_ANSWER" | "BUSY" | "FAILED"
    duration?: number;
    transcript?: string;
    userResponse?: string;
    failureReason?: string;
    answeredAt?: Date;
    endedAt?: Date;
  }) {
    const attempt = await prisma.reminderAttempt.findFirst({
      where: { vapiCallId: data.vapiCallId },
      include: { reminder: true },
    });

    if (!attempt) {
      console.warn(`[CallService] No attempt record found for Vapi call ID: ${data.vapiCallId}`);
      return;
    }

    const { reminder } = attempt;

    // Update attempt
    await prisma.reminderAttempt.update({
      where: { id: attempt.id },
      data: {
        status: data.status,
        duration: data.duration,
        transcript: data.transcript,
        userResponse: data.userResponse,
        failureReason: data.failureReason,
        answeredAt: data.answeredAt,
        endedAt: data.endedAt || new Date(),
      },
    });

    console.log(
      `📊 [CallService] Call ended for reminder "${reminder.title}" - Attempt #${attempt.attemptNumber} -> ${data.status}`
    );

    // If reminder was already completed or cancelled during the call by a tool, leave status as is
    const refreshedReminder = await prisma.reminder.findUnique({ where: { id: reminder.id } });
    if (
      refreshedReminder &&
      ["COMPLETED", "CANCELLED", "SNOOZED"].includes(refreshedReminder.status)
    ) {
      return;
    }

    // Unanswered / Busy / Failed calls -> Evaluate retry policy
    if (["NO_ANSWER", "BUSY", "FAILED"].includes(data.status)) {
      if (attempt.attemptNumber < reminder.maxAttempts) {
        console.log(
          `🔄 [CallService] Call ${data.status}. Scheduling retry attempt #${attempt.attemptNumber + 1} in ${reminder.retryIntervalMinutes} mins.`
        );
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: "SCHEDULED" },
        });
        await SchedulerService.scheduleRetry(
          reminder.id,
          reminder.retryIntervalMinutes,
          attempt.attemptNumber + 1
        );
      } else {
        console.log(
          `⚠️ [CallService] Max attempts (${reminder.maxAttempts}) reached for reminder "${reminder.title}". Marking as MISSED.`
        );
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: "MISSED" },
        });
      }
    } else if (data.status === "COMPLETED") {
      // If call finished normally and not snoozed/cancelled, check if user confirmed or acknowledged
      if (refreshedReminder?.status === "CALLING") {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: "ACKNOWLEDGED" },
        });
      }
    }
  }

  /**
   * Manual retry triggered by user from UI
   */
  public static async manualRetry(reminderId: string, userId: string) {
    const reminder = await prisma.reminder.findFirst({
      where: { id: reminderId, userId },
    });

    if (!reminder) {
      throw new Error("Reminder not found or unauthorized");
    }

    await SchedulerService.cancelPendingJobs(reminderId, reminder.maxAttempts + 5);

    // Reset status to SCHEDULED and trigger immediately
    await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: "SCHEDULED",
        scheduledAt: new Date(),
      },
    });

    return await SchedulerService.scheduleReminder(reminderId, new Date(), 1);
  }
}
