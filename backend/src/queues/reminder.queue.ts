import { Queue, QueueOptions } from "bullmq";
import { redisClient } from "../config/redis";

export const REMINDER_QUEUE_NAME = "reminder-queue";

export interface ReminderJobPayload {
  reminderId: string;
  attemptNumber: number;
}

const queueOptions: QueueOptions = {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 1, // BullMQ worker does not auto-retry immediately; our application worker coordinates retries via retry policy
    removeOnComplete: {
      age: 86400, // keep completed jobs for 24 hours for debugging
      count: 1000,
    },
    removeOnFail: {
      age: 86400 * 3, // keep failed jobs for 3 days
    },
  },
};

export const reminderQueue = new Queue<ReminderJobPayload>(REMINDER_QUEUE_NAME, queueOptions);

export class SchedulerService {
  /**
   * Schedule a reminder at a specific target Date
   */
  public static async scheduleReminder(
    reminderId: string,
    scheduledAt: Date,
    attemptNumber: number = 1
  ) {
    const now = Date.now();
    const delay = Math.max(0, new Date(scheduledAt).getTime() - now);
    const jobId = `rem-${reminderId}-att-${attemptNumber}`;

    // Remove any existing job with the same ID before scheduling
    try {
      const existing = await reminderQueue.getJob(jobId);
      if (existing) {
        await existing.remove();
      }
    } catch {
      // Ignore if job didn't exist
    }

    const job = await reminderQueue.add(
      "reminder:trigger",
      { reminderId, attemptNumber },
      {
        delay,
        jobId,
      }
    );

    console.log(
      `📅 [Scheduler] Scheduled reminder job "${jobId}" with delay of ${Math.round(delay / 1000)}s (due: ${scheduledAt.toISOString()})`
    );

    return job;
  }

  /**
   * Schedule a retry job after a specific interval in minutes
   */
  public static async scheduleRetry(
    reminderId: string,
    retryIntervalMinutes: number,
    attemptNumber: number
  ) {
    const delayMs = Math.max(0, retryIntervalMinutes * 60 * 1000);
    const scheduledDate = new Date(Date.now() + delayMs);
    const jobId = `rem-${reminderId}-att-${attemptNumber}`;

    try {
      const existing = await reminderQueue.getJob(jobId);
      if (existing) {
        await existing.remove();
      }
    } catch {
      // Ignore
    }

    const job = await reminderQueue.add(
      "reminder:trigger",
      { reminderId, attemptNumber },
      {
        delay: delayMs,
        jobId,
      }
    );

    console.log(
      `🔁 [Scheduler] Scheduled attempt #${attemptNumber} retry for reminder ${reminderId} in ${retryIntervalMinutes}m (${scheduledDate.toISOString()})`
    );

    return job;
  }

  /**
   * Cancel any pending delayed jobs for a reminder
   */
  public static async cancelPendingJobs(reminderId: string, maxAttempts: number = 5) {
    for (let i = 1; i <= maxAttempts; i++) {
      const jobId = `rem-${reminderId}-att-${i}`;
      try {
        const job = await reminderQueue.getJob(jobId);
        if (job) {
          const state = await job.getState();
          if (state === "delayed" || state === "waiting") {
            await job.remove();
            console.log(`🚫 [Scheduler] Cancelled pending job "${jobId}"`);
          }
        }
      } catch (err) {
        console.warn(`Could not cancel job ${jobId}:`, err);
      }
    }
  }
}
