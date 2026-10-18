import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import prisma from "../../config/db";
import { z } from "zod";
import { toE164 } from "../../utils/phone.utils";

const updateSettingsSchema = z.object({
  timezone: z.string().optional(),
  callingStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:mm").optional(),
  callingEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:mm").optional(),
  defaultMaxAttempts: z.number().int().min(1).max(10).optional(),
  defaultRetryInterval: z.number().int().min(1).max(120).optional(),
  phone: z.string().min(8).optional(),
  preferredVoice: z.string().optional(),
});

export class UserController {
  /**
   * GET /api/users/settings
   */
  public static async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      let settings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          timezone: true,
          callingStartTime: true,
          callingEndTime: true,
          defaultMaxAttempts: true,
          defaultRetryInterval: true,
          preferredVoice: true,
          plan: true,
          maxReminders: true,
        },
      });

      if (!settings && user) {
        settings = await prisma.userSettings.create({
          data: {
            userId,
            timezone: user.timezone || "Asia/Kolkata",
            callingStartTime: user.callingStartTime || "08:00",
            callingEndTime: user.callingEndTime || "22:00",
            defaultMaxAttempts: user.defaultMaxAttempts || 3,
            defaultRetryInterval: user.defaultRetryInterval || 10,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          settings,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/users/settings
   */
  public static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten() });
        return;
      }

      const {
        timezone,
        callingStartTime,
        callingEndTime,
        defaultMaxAttempts,
        defaultRetryInterval,
        phone,
        preferredVoice,
      } = parsed.data;

      // Update User table
      const userUpdate: any = {};
      if (timezone) userUpdate.timezone = timezone;
      if (callingStartTime) userUpdate.callingStartTime = callingStartTime;
      if (callingEndTime) userUpdate.callingEndTime = callingEndTime;
      if (defaultMaxAttempts) userUpdate.defaultMaxAttempts = defaultMaxAttempts;
      if (defaultRetryInterval) userUpdate.defaultRetryInterval = defaultRetryInterval;
      if (phone) {
        const normalizedPhone = toE164(phone);
        if (!normalizedPhone) {
          res.status(400).json({
            success: false,
            message: "Please enter a valid phone number including the country code.",
          });
          return;
        }
        const taken = await prisma.user.findFirst({
          where: { phone: normalizedPhone, id: { not: userId } },
        });
        if (taken) {
          res.status(409).json({
            success: false,
            message: "This phone number is already registered to another account.",
          });
          return;
        }
        userUpdate.phone = normalizedPhone;
        userUpdate.isPhoneVerified = false;
      }
      if (preferredVoice) userUpdate.preferredVoice = preferredVoice;

      await prisma.user.update({
        where: { id: userId },
        data: userUpdate,
      });

      // Upsert UserSettings table
      const settings = await prisma.userSettings.upsert({
        where: { userId },
        create: {
          userId,
          timezone: timezone || "Asia/Kolkata",
          callingStartTime: callingStartTime || "08:00",
          callingEndTime: callingEndTime || "22:00",
          defaultMaxAttempts: defaultMaxAttempts || 3,
          defaultRetryInterval: defaultRetryInterval || 10,
        },
        update: {
          ...(timezone && { timezone }),
          ...(callingStartTime && { callingStartTime }),
          ...(callingEndTime && { callingEndTime }),
          ...(defaultMaxAttempts && { defaultMaxAttempts }),
          ...(defaultRetryInterval && { defaultRetryInterval }),
        },
      });

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: settings,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
