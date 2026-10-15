import { z } from "zod";

export const createReminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000).optional(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().datetime()).or(z.date()),
  timezone: z.string().default("Asia/Kolkata"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  notificationChannel: z.enum(["PHONE", "WHATSAPP", "PUSH", "SMS"]).default("PHONE"),
  voicePersona: z.string().optional(),
  retryPolicy: z
    .object({
      maxAttempts: z.number().int().min(1).max(10).default(3),
      retryIntervalMinutes: z.number().int().min(1).max(120).default(10),
    })
    .optional(),
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().datetime()).or(z.date()).optional(),
  timezone: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  voicePersona: z.string().optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  retryIntervalMinutes: z.number().int().min(1).max(120).optional(),
});

export const snoozeReminderSchema = z.object({
  minutes: z.number().int().min(1).max(1440).optional(),
  newScheduledAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
});
