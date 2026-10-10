import { Request, Response } from "express";
import { ToolCallResult, VapiToolsService } from "./vapi.tools";
import { CallService } from "../calls/call.service";
import prisma from "../../config/db";

/**
 * Identify the reminder and user a Vapi call belongs to. The attempt record (keyed by Vapi call ID)
 * is authoritative; call metadata is the fallback. Never trust IDs supplied by the LLM.
 */
const resolveCallContext = async (message: any): Promise<{ reminderId?: string; userId?: string }> => {
  const call = message.call || {};

  if (call.id) {
    const attempt = await prisma.reminderAttempt.findFirst({
      where: { vapiCallId: call.id },
      include: { reminder: { select: { id: true, userId: true } } },
    });
    if (attempt) {
      return { reminderId: attempt.reminder.id, userId: attempt.reminder.userId };
    }
  }

  const metadata = call.assistantOverrides?.metadata || call.assistant?.metadata || message.assistant?.metadata || {};
  return { reminderId: metadata.reminderId, userId: metadata.userId };
};

export class VapiWebhookController {
  /**
   * Main Vapi Webhook entrypoint
   * POST /api/webhooks/vapi
   */
  public static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;
      const message = payload.message || payload;
      const type = message.type || payload.type;

      console.log(`
📥 [Vapi Webhook] Received event: "${type}"`);

      // 1. Tool Calls / Function Calls
      if (type === "tool-calls" || type === "function-call") {
        const toolCalls = message.toolCalls || message.toolCallList || (message.functionCall ? [message.functionCall] : []);
        const { reminderId, userId } = await resolveCallContext(message);
        const results: ToolCallResult[] = [];

        for (const call of toolCalls) {
          const toolCallId = call.id || call.toolCallId || "tool_" + Date.now();
          const func = call.function || call;
          const funcName = func.name;

          let args: any = {};
          try {
            args = typeof func.arguments === "string" ? JSON.parse(func.arguments) : func.arguments || {};
          } catch {
            results.push({ toolCallId, error: "Tool arguments were not valid JSON." });
            continue;
          }

          console.log(`🔧 [Vapi Webhook] Executing tool: ${funcName} (reminder ${reminderId})`, args);

          if (funcName !== "create_reminder" && !reminderId) {
            results.push({ toolCallId, error: "Could not identify the reminder for this call." });
            continue;
          }

          let toolResult: ToolCallResult;
          switch (funcName) {
            case "complete_reminder":
              toolResult = await VapiToolsService.completeReminder(reminderId!, toolCallId);
              break;
            case "snooze_reminder":
              toolResult = await VapiToolsService.snoozeReminder(reminderId!, args, toolCallId);
              break;
            case "cancel_reminder":
              toolResult = await VapiToolsService.cancelReminder(reminderId!, toolCallId);
              break;
            case "get_reminder":
              toolResult = await VapiToolsService.getReminder(reminderId!, toolCallId);
              break;
            case "create_reminder":
              toolResult = userId
                ? await VapiToolsService.createReminder(userId, args, toolCallId)
                : { toolCallId, error: "Could not identify the user for this call." };
              break;
            default:
              toolResult = { toolCallId, error: `Tool "${funcName}" not recognized.` };
          }

          results.push(toolResult);
        }

        res.status(200).json({ results });
        return;
      }

      // 2. Status Updates (Ringing, In-Progress, etc.)
      if (type === "status-update") {
        const callId = message.call?.id || payload.callId;
        const callStatus = message.status;

        console.log(`📞 [Vapi Webhook] Status update for call ${callId}: ${callStatus}`);
        await CallService.handleStatusUpdate(callId, callStatus);
        res.status(200).json({ success: true });
        return;
      }

      // 3. End of Call Report
      if (type === "end-of-call-report" || type === "call-ended") {
        const call = message.call || payload.call || {};
        const callId = call.id || payload.callId;
        const endedReason = message.endedReason || call.endedReason || "normal-end";
        const duration = Math.round(
          message.durationSeconds || call.durationSeconds || (message.durationMinutes ? message.durationMinutes * 60 : 0)
        );
        const transcript = message.artifact?.transcript || message.transcript || call.transcript || "";
        const status = CallService.mapEndedReason(endedReason);

        await CallService.handleCallCompletion({
          vapiCallId: callId,
          status,
          duration,
          transcript,
          failureReason: status !== "COMPLETED" ? endedReason : undefined,
          endedAt: message.endedAt ? new Date(message.endedAt) : new Date(),
        });

        res.status(200).json({ success: true });
        return;
      }

      // Default acknowledgement for any other event
      res.status(200).json({ success: true, message: `Event ${type} acknowledged` });
    } catch (error: any) {
      console.error("❌ [Vapi Webhook] Error processing webhook event:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Simulation webhook for local testing of complete / snooze / no-answer
   * POST /api/webhooks/vapi/simulate
   */
  public static async simulateCallResult(req: Request, res: Response): Promise<void> {
    const { reminderId, outcome, minutes } = req.body;
    // outcome: "DONE" | "SNOOZE" | "NO_ANSWER" | "CANCEL"

    try {
      if (outcome === "DONE") {
        const result = await VapiToolsService.completeReminder(reminderId, "sim_tool_done");
        res.status(200).json({ success: true, result });
        return;
      }

      if (outcome === "SNOOZE") {
        const result = await VapiToolsService.snoozeReminder(
          reminderId,
          { minutes: minutes || 30 },
          "sim_tool_snooze"
        );
        res.status(200).json({ success: true, result });
        return;
      }

      if (outcome === "CANCEL") {
        const result = await VapiToolsService.cancelReminder(reminderId, "sim_tool_cancel");
        res.status(200).json({ success: true, result });
        return;
      }

      if (outcome === "NO_ANSWER") {
        // Find latest attempt and simulate NO_ANSWER
        const attempt = await prisma.reminderAttempt.findFirst({
          where: { reminderId },
          orderBy: { attemptNumber: "desc" },
        });

        if (attempt?.vapiCallId) {
          await CallService.handleCallCompletion({
            vapiCallId: attempt.vapiCallId,
            status: "NO_ANSWER",
            failureReason: "customer-did-not-answer",
          });
        }
        res.status(200).json({ success: true, message: "Simulated NO_ANSWER" });
        return;
      }

      res.status(400).json({ success: false, message: "Invalid outcome specified" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
