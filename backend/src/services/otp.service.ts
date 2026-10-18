import prisma from "../config/db";
import { EmailService } from "./email.service";

/** Max codes one identifier may request inside the window */
export const OTP_LIMIT = 5;
export const OTP_WINDOW_MINUTES = 10;

export class OtpRateLimitError extends Error {
  constructor(public retryAfterMinutes: number) {
    super(`Too many codes requested. Try again in ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? "" : "s"}.`);
    this.name = "OtpRateLimitError";
  }
}

export class OtpService {
  /**
   * Generates a 6-digit numeric OTP code.
   */
  public static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Creates an OTP in the database with a 5-minute expiry.
   */
  public static async createOtp(identifier: string, type: "PHONE" | "EMAIL"): Promise<string> {
    await this.assertUnderLimit(identifier, type);

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create the new OTP record
    await prisma.otpVerification.create({
      data: {
        identifier,
        code,
        type,
        expiresAt,
        consumed: false,
      },
    });

    // Development / Console log simulation for testing
    console.log(`\n========================================`);
    console.log(`🔔 [OTP DISPATCH] Type: ${type}`);
    console.log(`📱 Recipient: ${identifier}`);
    console.log(`🔑 Verification Code: ${code}`);
    console.log(`⏰ Valid for: 5 minutes (until ${expiresAt.toLocaleTimeString()})`);
    console.log(`========================================\n`);

    // Dispatch email via Brevo SMTP if type is EMAIL
    if (type === "EMAIL") {
      await EmailService.sendOtpEmail(identifier, code);
    }

    return code;
  }

  /**
   * Throws OtpRateLimitError when the identifier already requested OTP_LIMIT codes
   * inside the last OTP_WINDOW_MINUTES (covers resend spam on signup and login).
   */
  private static async assertUnderLimit(identifier: string, type: "PHONE" | "EMAIL"): Promise<void> {
    const windowStart = new Date(Date.now() - OTP_WINDOW_MINUTES * 60 * 1000);
    const recent = await prisma.otpVerification.findMany({
      where: { identifier, type, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    if (recent.length >= OTP_LIMIT) {
      const oldest = recent[0].createdAt.getTime();
      const retryAfterMs = oldest + OTP_WINDOW_MINUTES * 60 * 1000 - Date.now();
      throw new OtpRateLimitError(Math.max(1, Math.ceil(retryAfterMs / 60000)));
    }
  }

  /**
   * Verifies an OTP code for a given identifier and type.
   */
  public static async verifyOtp(identifier: string, code: string, type: "PHONE" | "EMAIL"): Promise<boolean> {
    // Master bypass for testing if configured, or check DB
    const record = await prisma.otpVerification.findFirst({
      where: {
        identifier,
        code,
        type,
        consumed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return false;
    }

    // Mark as consumed so it cannot be re-used
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { consumed: true },
    });

    return true;
  }
}
