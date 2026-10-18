import { Worker, Job } from "bullmq";
import { redisClient } from "../config/redis";
import {
  RECONCILE_CALLS_JOB,
  REMINDER_QUEUE_NAME,
  ReminderJobPayload,
  SchedulerService,
} from "../queues/reminder.queue";
import prisma from "../config/db";
import { checkCallingHours } from "../utils/timezone.utils";
import { CallService } from "../modules/calls/call.service";

export const createReminderWorker = () => {
  const worker = new Worker<ReminderJobPayload>(
    REMINDER_QUEUE_NAME,
    async (job: Job<ReminderJobPayload>) => {
      if (job.name === RECONCILE_CALLS_JOB) {
        await CallService.reconcileStuckCalls();
        return;
      }

      const { reminderId, attemptNumber } = job.data;
      // Jobs queued before cycles existed carry only attemptNumber, which was the cycle position then
      const cycleAttempt = job.data.cycleAttempt ?? attemptNumber;
      console.log(`\n⚙️ [Reminder Worker] Processing job ${job.id} for Reminder: ${reminderId} (Attempt #${attemptNumber})`);

      // 1. Fetch reminder with user settings
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId },
        include: { user: true },
      });

      if (!reminder) {
        console.warn(`[Reminder Worker] Reminder ${reminderId} not found in database. Terminating job.`);
        return;
      }

      // 2. Check if reminder is already finished or stopped
      if (["COMPLETED", "CANCELLED"].includes(reminder.status)) {
        console.log(`[Reminder Worker] Reminder ${reminderId} is ${reminder.status}. No action taken.`);
        return;
      }

      // 3. Verify calling hours in user's timezone
      const timeZone = reminder.timezone || reminder.user.timezone || "Asia/Kolkata";
      const startTime = reminder.user.callingStartTime || "08:00";
      const endTime = reminder.user.callingEndTime || "22:00";

      const hoursCheck = checkCallingHours(new Date(), timeZone, startTime, endTime);

      if (!hoursCheck.isAllowed && hoursCheck.nextAllowedDate) {
        console.log(
          `🌙 [Reminder Worker] ${hoursCheck.reason} Postponing reminder "${reminder.title}" to ${hoursCheck.nextAllowedDate.toISOString()}`
        );
        // A new job ID is required: BullMQ ignores an add() that reuses the ID of the job now running
        await SchedulerService.scheduleReminder(reminder.id, hoursCheck.nextAllowedDate, attemptNumber, {
          cycleAttempt,
          jobIdSuffix: `t${hoursCheck.nextAllowedDate.getTime()}`,
        });
        return;
      }

      // 4. Initiate outbound call through CallService
      await CallService.initiateOutboundCall({
        reminderId,
        attemptNumber: attemptNumber || 1,
        cycleAttempt,
      });

      console.log(`✨ [Reminder Worker] Outbound call processed successfully for job ${job.id}`);
    },
    {
      connection: redisClient,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    console.log(`✔️ [Reminder Worker] Job ${job.id} marked completed.`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ [Reminder Worker] Job ${job?.id} failed with error:`, err.message);
  });

  worker.on("error", (err) => {
    console.error(`❌ [Reminder Worker] Worker internal error:`, err);
  });

  return worker;
};

export let reminderWorker: Worker<ReminderJobPayload> | null = null;

export const startReminderWorker = () => {
  if (!reminderWorker) {
    reminderWorker = createReminderWorker();
    console.log("🚀 [Reminder Worker] BullMQ worker initialized and listening for jobs.");
  }
  return reminderWorker;
};

export const stopReminderWorker = async () => {
  if (reminderWorker) {
    console.log("🛑 [Reminder Worker] Closing BullMQ worker...");
    await reminderWorker.close();
    reminderWorker = null;
    console.log("🔌 [Reminder Worker] BullMQ worker stopped.");
  }
};
