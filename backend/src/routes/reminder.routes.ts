import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { ReminderController } from "../modules/reminders/reminder.controller";
import { CallController } from "../modules/calls/call.controller";

const router = Router();

// All reminder endpoints require authentication
router.use(authenticate as any);

// Dashboard collection queries (registered before /:id)
router.get("/upcoming", ReminderController.upcoming as any);
router.get("/completed", ReminderController.completed as any);
router.get("/missed", ReminderController.missed as any);

// Reminder CRUD
router.post("/", ReminderController.create as any);
router.get("/", ReminderController.list as any);
router.get("/:id", ReminderController.getById as any);
router.patch("/:id", ReminderController.update as any);
router.delete("/:id", ReminderController.delete as any);

// Reminder Actions
router.post("/:id/complete", ReminderController.complete as any);
router.post("/:id/snooze", ReminderController.snooze as any);
router.post("/:id/cancel", ReminderController.cancel as any);

// Call Actions & History
router.get("/:id/attempts", CallController.getReminderAttempts as any);
router.post("/:id/retry", CallController.retryNow as any);

export default router;
