import { Request, Response } from "express";
import { VapiToolsService } from "./vapi.tools";
import { CallService } from "../calls/call.service";
import prisma from "../../config/db";

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

      console.log(`\n📥 [Vapi Webhook] Received event: "${type}"`);

      // 1. Tool Calls / Function Calls
      if (type === "tool-calls" || type === "function-call") {
        const toolCalls = message.toolCalls || (message.functionCall ? [message.functionCall] : []);
        const results = [];

        for (const call of toolCalls) {
          const toolCallId = call.id || call.toolCallId || "tool_" + Date.now();
          const func = call.function || call;
          const funcName = func.name;
          const args = typeof func.arguments === "string" ? JSON.parse(func.arguments) : (func.arguments || {});

          console.log(`🔧 [Vapi Webhook] Executing tool: ${funcName}`, args);

          let toolResult;
          switch (funcName) {
            case "complete_reminder":
              toolResult = await VapiToolsService.completeReminder(args.reminderId, toolCallId);
              break;
            case "snooze_reminder":
              toolResult = await VapiToolsService.snoozeReminder(args.reminderId, args, toolCallId);
              break;
            case "cancel_reminder":
              toolResult = await VapiToolsService.cancelReminder(args.reminderId, toolCallId);
              break;
            case "get_reminder":
              toolResult = await VapiToolsService.getReminder(args.reminderId, toolCallId);
              break;
            case "create_reminder":
              const userId = message.call?.customer?.id || message.call?.assistantOverrides?.variableValues?.userId;
              toolResult = await VapiToolsService.createReminder(userId, args, toolCallId);
              break;
            default:
              toolResult = {
                toolCallId,
                result: { success: false, message: `Tool "${funcName}" not recognized.` },
              };
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
        res.status(200).json({ success: true });
        return;
      }

      // 3. End of Call Report
      if (type === "end-of-call-report" || type === "call-ended") {
        const call = message.call || payload.call || {};
        const callId = call.id || payload.callId;
        const endedReason = message.endedReason || call.endedReason || "normal-end";
        const duration = Math.round(message.durationSeconds || call.durationSeconds || (message.durationMinutes ? message.durationMinutes * 60 : 0));
        const transcript = message.transcript || call.transcript || "";

        let status = "COMPLETED";
        if (
          endedReason.includes("not-answer") ||
          endedReason.includes("no-answer") ||
          endedReason === "customer-did-not-answer"
        ) {
          status = "NO_ANSWER";
        } else if (endedReason.includes("busy") || endedReason === "customer-busy") {
          status = "BUSY";
        } else if (endedReason.includes("failed") || endedReason === "call-failed") {
          status = "FAILED";
        }

        await CallService.handleCallCompletion({
          vapiCallId: callId,
          status,
          duration,
          transcript,
          failureReason: status !== "COMPLETED" ? endedReason : undefined,
          endedAt: new Date(),
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
