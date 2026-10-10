import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ReminderService } from "./reminder.service";
import {
  createReminderSchema,
  updateReminderSchema,
  snoozeReminderSchema,
} from "./reminder.types";

export class ReminderController {
  /**
   * POST /api/reminders
   */
  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const parsed = createReminderSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten() });
        return;
      }

      const reminder = await ReminderService.createReminder({
        userId,
        ...parsed.data,
      });

      res.status(201).json({
        success: true,
        data: reminder,
        message: "Reminder scheduled successfully",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/reminders
   */
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const { date, status } = req.query as { date?: string; status?: string };
      const reminders = await ReminderService.listReminders(userId, { date, status });

      res.status(200).json({
        success: true,
        data: reminders,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/reminders/upcoming
   */
  public static async upcoming(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const reminders = await ReminderService.getUpcoming(userId);
      res.status(200).json({ success: true, data: reminders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/reminders/completed
   */
  public static async completed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const reminders = await ReminderService.getCompleted(userId);
      res.status(200).json({ success: true, data: reminders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/reminders/missed
   */
  public static async missed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const reminders = await ReminderService.getMissed(userId);
      res.status(200).json({ success: true, data: reminders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/reminders/:id
   */
  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const reminder = await ReminderService.getReminderById(req.params.id, userId);
      res.status(200).json({ success: true, data: reminder });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/reminders/:id
   */
  public static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const parsed = updateReminderSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten() });
        return;
      }

      const updated = await ReminderService.updateReminder(req.params.id, userId, parsed.data);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/reminders/:id/complete
   */
  public static async complete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const updated = await ReminderService.completeReminder(req.params.id, userId);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/reminders/:id/snooze
   */
  public static async snooze(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const parsed = snoozeReminderSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten() });
        return;
      }

      const updated = await ReminderService.snoozeReminder(req.params.id, userId, parsed.data);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/reminders/:id/cancel
   */
  public static async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const updated = await ReminderService.cancelReminder(req.params.id, userId);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/reminders/:id
   */
  public static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      await ReminderService.deleteReminder(req.params.id, userId);
      res.status(200).json({ success: true, message: "Reminder deleted" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
