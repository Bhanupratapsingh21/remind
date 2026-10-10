import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import prisma from "../../config/db";
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
