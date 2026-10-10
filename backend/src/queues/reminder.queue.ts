import { Queue, QueueOptions } from "bullmq";
import { redisClient } from "../config/redis";
import prisma from "../config/db";

export const REMINDER_QUEUE_NAME = "reminder-queue";
export const REMINDER_TRIGGER_JOB = "reminder:trigger";
export const RECONCILE_CALLS_JOB = "reminder:reconcile-calls";

export interface ReminderJobPayload {
  reminderId: string;
  /** Unique, ever-increasing number per call placed for this reminder (ReminderAttempt.attemptNumber) */
  attemptNumber: number;
  /** Position within the current retry cycle (1..maxAttempts). A snooze or manual retry starts a new cycle. */
  cycleAttempt?: number;
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
   * Next unused attempt number for a reminder. Every call gets its own number so the
   * worker's duplicate-call check never mistakes a new call for an old one.
   */
  public static async getNextAttemptNumber(reminderId: string): Promise<number> {
    const last = await prisma.reminderAttempt.findFirst({
      where: { reminderId },
      orderBy: { attemptNumber: "desc" },
      select: { attemptNumber: true },
    });
    return (last?.attemptNumber ?? 0) + 1;
  }

  /**
   * Schedule a reminder at a specific target Date.
   * `jobIdSuffix` gives a re-queued job (e.g. postponed by calling hours) an ID distinct from the job currently running.
   */
  public static async scheduleReminder(
    reminderId: string,
    scheduledAt: Date,
    attemptNumber: number = 1,
    options: { cycleAttempt?: number; jobIdSuffix?: string } = {}
  ) {
    const now = Date.now();
    const delay = Math.max(0, new Date(scheduledAt).getTime() - now);
    const jobId = `rem-${reminderId}-att-${attemptNumber}${options.jobIdSuffix ? `-${options.jobIdSuffix}` : ""}`;

    // Remove any existing job with the same ID before scheduling
    try {
      const existing = await reminderQueue.getJob(jobId);
      if (existing) {
        await existing.remove();
      }
    } catch {
      // Ignore if job didn't exist or is active
    }

    const job = await reminderQueue.add(
      REMINDER_TRIGGER_JOB,
      { reminderId, attemptNumber, cycleAttempt: options.cycleAttempt ?? 1 },
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
   * Cancel whatever is pending and start a fresh retry cycle at `scheduledAt`
   * (new reminder, reschedule, snooze, manual retry).
   */
  public static async startNewCycle(reminderId: string, scheduledAt: Date) {
    await this.cancelPendingJobs(reminderId);
    const attemptNumber = await this.getNextAttemptNumber(reminderId);
    return this.scheduleReminder(reminderId, scheduledAt, attemptNumber, { cycleAttempt: 1 });
  }

  /**
   * Schedule a retry job after a specific interval in minutes
   */
  public static async scheduleRetry(
    reminderId: string,
    retryIntervalMinutes: number,
    cycleAttempt: number
  ) {
    const attemptNumber = await this.getNextAttemptNumber(reminderId);
    const scheduledDate = new Date(Date.now() + Math.max(0, retryIntervalMinutes * 60 * 1000));

    const job = await this.scheduleReminder(reminderId, scheduledDate, attemptNumber, { cycleAttempt });

    console.log(
      `🔁 [Scheduler] Scheduled attempt #${attemptNumber} (cycle try ${cycleAttempt}) for reminder ${reminderId} in ${retryIntervalMinutes}m`
    );

    return job;
  }

  /**
   * Cancel any pending (delayed / waiting) jobs for a reminder
   */
  public static async cancelPendingJobs(reminderId: string) {
    const jobs = await reminderQueue.getJobs(["delayed", "waiting", "prioritized"]);
    for (const job of jobs) {
      if (job?.name !== REMINDER_TRIGGER_JOB || job.data?.reminderId !== reminderId) continue;
      try {
        await job.remove();
        console.log(`🚫 [Scheduler] Cancelled pending job "${job.id}"`);
      } catch (err) {
        console.warn(`Could not cancel job ${job.id}:`, err);
      }
    }
  }

  /**
   * Register the repeatable job that reconciles calls stuck in CALLING
   */
  public static async scheduleCallReconciliation(everyMinutes: number = 5) {
    await reminderQueue.upsertJobScheduler(
      RECONCILE_CALLS_JOB,
      { every: everyMinutes * 60 * 1000 },
      { name: RECONCILE_CALLS_JOB, data: { reminderId: "", attemptNumber: 0 } }
    );
  }
}
