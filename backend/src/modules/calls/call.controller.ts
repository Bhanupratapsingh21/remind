import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import prisma from "../../config/db";
import { isPaidPlan } from "../billing/plans";
import { CONNECTED_CALL } from "./call.constants";
import { CallService } from "./call.service";

export class CallController {
  /**
   * Get all call attempts for a reminder
   * GET /api/reminders/:id/attempts
   */
  public static async getReminderAttempts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // Ensure reminder belongs to the user
      const reminder = await prisma.reminder.findFirst({
        where: { id, userId },
      });

      if (!reminder) {
        res.status(404).json({ success: false, message: "Reminder not found" });
        return;
      }

      const attempts = await prisma.reminderAttempt.findMany({
        where: { reminderId: id },
        orderBy: { attemptNumber: "asc" },
      });

      res.status(200).json({
        success: true,
        data: attempts,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Trigger immediate call / retry now
   * POST /api/reminders/:id/retry
   */
  public static async retryNow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // Free accounts get one test reminder; "call now" must not turn it into unlimited free calls
      if (!isPaidPlan(req.user?.plan)) {
        const calls = await prisma.reminderAttempt.count({ where: { reminderId: id, ...CONNECTED_CALL } });
        if (calls > 0) {
          res.status(402).json({
            success: false,
            code: "PLAN_LIMIT",
            message: "Calling again on demand is part of Basic and Pro. Choose a plan to keep going.",
          });
          return;
        }
      }

      await CallService.manualRetry(id, userId);

      res.status(200).json({
        success: true,
        message: "Call retry scheduled immediately.",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
