import prisma from "../../config/db";
import { VapiService } from "../vapi/vapi.service";
import { SchedulerService } from "../../queues/reminder.queue";

/** Attempt outcomes that trigger the retry policy */
const RETRYABLE_STATUSES = ["NO_ANSWER", "BUSY", "FAILED", "VOICEMAIL"];
/** Attempt statuses that mean the call is over */
const FINAL_ATTEMPT_STATUSES = ["COMPLETED", ...RETRYABLE_STATUSES];
/** A CALLING reminder with no webhook for this long gets checked against the Vapi API */
const STUCK_CALL_MINUTES = 15;

export class CallService {
  /**
   * Map Vapi's endedReason to an attempt status.
   * Voicemail, silence and carrier/SIP/pipeline errors are retryable rather than treated as answered.
   */
  public static mapEndedReason(endedReason: string = ""): string {
    const reason = endedReason.toLowerCase();

    if (reason.includes("voicemail")) return "VOICEMAIL";
    if (reason.includes("busy")) return "BUSY";
    if (
      reason.includes("did-not-answer") ||
      reason.includes("no-answer") ||
      reason.includes("not-answer") ||
      reason === "silence-timed-out"
    ) {
      return "NO_ANSWER";
    }
    if (
      reason.includes("error") ||
      reason.includes("failed") ||
      reason.includes("fault") ||
      reason.startsWith("sip") ||
      reason.startsWith("pipeline") ||
      reason.startsWith("call.start") ||
      reason.startsWith("call.in-progress") ||
      reason.includes("provider-closed")
    ) {
      return "FAILED";
    }
    return "COMPLETED";
  }

  /**
   * Initiate an outbound call for a reminder attempt
   */
  public static async initiateOutboundCall(params: {
    reminderId: string;
    attemptNumber: number;
    cycleAttempt: number;
  }) {
    const { reminderId, attemptNumber, cycleAttempt } = params;

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

    // Mark reminder as CALLING; retryCount tracks the position in the current retry cycle
    await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: "CALLING",
        retryCount: cycleAttempt,
      },
    });

    try {
      console.log(
        `📞 [CallService] Initiating call for reminder "${reminder.title}" to ${recipientPhone} (Attempt #${attemptNumber}, try ${cycleAttempt}/${reminder.maxAttempts})`
      );

      const vapiResponse = await VapiService.createOutboundCall({
        phoneNumber: recipientPhone,
        userId: reminder.userId,
        userName: reminder.user.name || "there",
        reminderId: reminder.id,
        title: reminder.title,
        description: reminder.description,
        priority: reminder.priority,
        attemptNumber,
        timezone: reminder.timezone || reminder.user.timezone || "Asia/Kolkata",
        voicePersona: reminder.voicePersona || reminder.user.preferredVoice,
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
      if (cycleAttempt < reminder.maxAttempts) {
        await prisma.reminder.update({
          where: { id: reminderId },
          data: { status: "SCHEDULED" },
        });
        await SchedulerService.scheduleRetry(reminderId, reminder.retryIntervalMinutes, cycleAttempt + 1);
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
   * Handle Vapi status-update events (ringing / in-progress)
   */
  public static async handleStatusUpdate(vapiCallId: string, callStatus: string) {
    if (!vapiCallId) return;

    const attempt = await prisma.reminderAttempt.findFirst({ where: { vapiCallId } });
    if (!attempt || FINAL_ATTEMPT_STATUSES.includes(attempt.status)) return;

    if (callStatus === "in-progress" && attempt.status !== "ANSWERED") {
      await prisma.reminderAttempt.update({
        where: { id: attempt.id },
        data: { status: "ANSWERED", answeredAt: new Date() },
      });
    } else if (callStatus === "ringing" && attempt.status === "INITIATED") {
      await prisma.reminderAttempt.update({
        where: { id: attempt.id },
        data: { status: "RINGING" },
      });
    }
  }

  /**
   * Handle webhook end-of-call or status report
   */
  public static async handleCallCompletion(data: {
    vapiCallId: string;
    status: string; // "COMPLETED" | "NO_ANSWER" | "BUSY" | "FAILED" | "VOICEMAIL"
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

    // Duplicate end-of-call report (e.g. webhook retry after reconciliation already ran)
    if (FINAL_ATTEMPT_STATUSES.includes(attempt.status) && attempt.endedAt) {
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
        answeredAt: data.answeredAt ?? attempt.answeredAt,
        endedAt: data.endedAt || new Date(),
      },
    });

    await prisma.callLog.create({
      data: {
        reminderId: reminder.id,
        userId: reminder.userId,
        callSid: data.vapiCallId,
        duration: data.duration,
        status: data.status,
        transcript: data.transcript,
        userResponse: data.userResponse,
      },
    });

    console.log(
      `📊 [CallService] Call ended for reminder "${reminder.title}" - Attempt #${attempt.attemptNumber} -> ${data.status}`
    );

    // Only the call the reminder is currently waiting on drives the retry policy. If a tool completed,
    // cancelled or snoozed it during the call, or a newer call was scheduled, leave the status alone.
    const refreshedReminder = await prisma.reminder.findUnique({ where: { id: reminder.id } });
    if (!refreshedReminder || refreshedReminder.status !== "CALLING") {
      return;
    }

    // Unanswered / Busy / Voicemail / Failed calls -> Evaluate retry policy
    if (RETRYABLE_STATUSES.includes(data.status)) {
      const cycleAttempt = refreshedReminder.retryCount || 1;
      if (cycleAttempt < refreshedReminder.maxAttempts) {
        console.log(
          `🔄 [CallService] Call ${data.status}. Scheduling try ${cycleAttempt + 1}/${refreshedReminder.maxAttempts} in ${refreshedReminder.retryIntervalMinutes} mins.`
        );
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: "SCHEDULED" },
        });
        await SchedulerService.scheduleRetry(
          reminder.id,
          refreshedReminder.retryIntervalMinutes,
          cycleAttempt + 1
        );
      } else {
        console.log(
          `⚠️ [CallService] Max attempts (${refreshedReminder.maxAttempts}) reached for reminder "${reminder.title}". Marking as MISSED.`
        );
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: "MISSED" },
        });
      }
    } else if (data.status === "COMPLETED") {
      // Call finished normally without a complete / snooze / cancel tool call
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: "ACKNOWLEDGED" },
      });
    }
  }

  /**
   * Reminders stuck in CALLING (webhook lost or never delivered): ask Vapi how the call ended.
   */
  public static async reconcileStuckCalls() {
    if (VapiService.isMock) return;

    const stuck = await prisma.reminder.findMany({
      where: {
        status: "CALLING",
        updatedAt: { lt: new Date(Date.now() - STUCK_CALL_MINUTES * 60 * 1000) },
      },
      include: { attempts: { orderBy: { attemptNumber: "desc" }, take: 1 } },
    });

    for (const reminder of stuck) {
      const attempt = reminder.attempts[0];
      if (!attempt?.vapiCallId || attempt.vapiCallId.startsWith("vapi_sim_")) continue;

      try {
        const call = await VapiService.getCall(attempt.vapiCallId);
        if (call.status !== "ended") continue;

        const startedAt = call.startedAt ? new Date(call.startedAt) : undefined;
        const endedAt = call.endedAt ? new Date(call.endedAt) : new Date();
        const status = this.mapEndedReason(call.endedReason);

        console.log(`🧹 [CallService] Reconciling call ${attempt.vapiCallId} (${call.endedReason}) -> ${status}`);

        await this.handleCallCompletion({
          vapiCallId: attempt.vapiCallId,
          status,
          duration: startedAt ? Math.round((endedAt.getTime() - startedAt.getTime()) / 1000) : undefined,
          transcript: call.artifact?.transcript || call.transcript,
          failureReason: status !== "COMPLETED" ? call.endedReason : undefined,
          answeredAt: startedAt,
          endedAt,
        });
      } catch (error: any) {
        console.error(
          `❌ [CallService] Could not reconcile call ${attempt.vapiCallId}:`,
          error.response?.data || error.message
        );
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

    // Reset status to SCHEDULED and trigger immediately as a fresh retry cycle
    await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: "SCHEDULED",
        scheduledAt: new Date(),
        retryCount: 0,
      },
    });

    return await SchedulerService.startNewCycle(reminderId, new Date());
  }
}
