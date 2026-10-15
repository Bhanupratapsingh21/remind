import prisma from "../../config/db";

export class ReminderRepository {
  public static async findById(id: string, userId: string) {
    return prisma.reminder.findFirst({
      where: { id, userId },
      include: {
        attempts: {
          orderBy: { attemptNumber: "asc" },
        },
      },
    });
  }

  public static async findMany(params: {
    userId: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const { userId, status, fromDate, toDate } = params;

    const whereClause: any = { userId };

    if (status) {
      whereClause.status = status;
    }

    if (fromDate || toDate) {
      whereClause.scheduledAt = {};
      if (fromDate) whereClause.scheduledAt.gte = fromDate;
      if (toDate) whereClause.scheduledAt.lte = toDate;
    }

    return prisma.reminder.findMany({
      where: whereClause,
      orderBy: { scheduledAt: "asc" },
      include: {
        attempts: {
          orderBy: { attemptNumber: "asc" },
        },
      },
    });
  }

  public static async countActiveByUser(userId: string) {
    return prisma.reminder.count({
      where: {
        userId,
        status: { in: ["SCHEDULED", "CALLING", "SNOOZED"] },
      },
    });
  }

  public static async create(data: {
    userId: string;
    title: string;
    description?: string;
    scheduledAt: Date;
    timezone: string;
    priority: string;
    notificationChannel: string;
    voicePersona?: string;
    maxAttempts: number;
    retryIntervalMinutes: number;
  }) {
    return prisma.reminder.create({
      data: {
        ...data,
        task: data.title, // sync backward-compatible field
        status: "SCHEDULED",
      },
    });
  }

  public static async update(id: string, userId: string, data: any) {
    return prisma.reminder.updateMany({
      where: { id, userId },
      data,
    });
  }

  public static async delete(id: string, userId: string) {
    return prisma.reminder.deleteMany({
      where: { id, userId },
    });
  }
}
