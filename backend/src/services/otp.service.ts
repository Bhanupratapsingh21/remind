import prisma from "../config/db";
import { EmailService } from "./email.service";

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
