import nodemailer, { Transporter } from "nodemailer";
import { ENV } from "../config/env";

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | null {
    if (!this.transporter && ENV.SMTP_HOST && ENV.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465, // true for 465, false for other ports like 587
        // Fail fast: a blocked SMTP port otherwise hangs for minutes and the login request times out
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Sends a 6-digit verification code to the recipient's email address
   */
  public static async sendOtpEmail(toEmail: string, code: string): Promise<boolean> {
    const transporter = this.getTransporter();

    const subject = `Your Verification Code: ${code}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 24px; color: #151515; }
          .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #eaeaea; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #151515; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 600; margin-bottom: 8px; color: #111827; }
          .text { font-size: 14px; line-height: 1.5; color: #4b5563; margin-bottom: 24px; }
          .code-box { background: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 8px; text-align: center; padding: 18px; margin-bottom: 24px; }
          .code { font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827; font-family: monospace; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✦ Remind / Eavara</div>
          <div class="title">Verify your email address</div>
          <p class="text">Please enter the 6-digit verification code below to confirm your account:</p>
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          <p class="text" style="font-size: 13px; color: #6b7280;">
            This code will expire in <strong>5 minutes</strong>. If you did not make this request, you can safely ignore this email.
          </p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Remind AI. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Your verification code is: ${code}. It expires in 5 minutes.`;

    // Brevo's HTTPS API first when a key is set: hosts like Render can block outbound SMTP ports
    if (ENV.BREVO_API_KEY) {
      return this.sendViaBrevoApi(toEmail, subject, text, htmlContent);
    }

    // If Brevo SMTP is configured, attempt sending live email
    if (transporter && ENV.SMTP_PASS) {
      try {
        const info = await transporter.sendMail({
          from: ENV.SMTP_FROM,
          to: toEmail,
          subject,
          text,
          html: htmlContent,
        });

        console.log(`✉️ [BREVO SMTP SUCCESS] Sent OTP to ${toEmail}. Message ID: ${info.messageId}`);
        return true;
      } catch (error) {
        console.error(`❌ [BREVO SMTP ERROR] Failed to send email to ${toEmail}:`, error);
        // Fall back to console print in dev so process doesn't halt
        return false;
      }
    } else {
      console.log(`⚠️ [SMTP NOT CONFIGURED] Brevo SMTP credentials not set. Simulated email OTP sent:`);
      console.log(`✉️ Recipient: ${toEmail}`);
      console.log(`🔑 Verification Code: ${code}`);
      return true;
    }
  }

  /** Plain operational email (alerts to the owner). Uses the API when configured, else SMTP. */
  public static async sendPlain(toEmail: string, subject: string, text: string): Promise<boolean> {
    const html = `<pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>`;
    if (ENV.BREVO_API_KEY) return this.sendViaBrevoApi(toEmail, subject, text, html);
    const transporter = this.getTransporter();
    if (!transporter || !ENV.SMTP_PASS) {
      console.warn(`⚠️ [Email] Not configured; alert not sent: ${subject}`);
      return false;
    }
    try {
      await transporter.sendMail({ from: ENV.SMTP_FROM, to: toEmail, subject, text, html });
      return true;
    } catch (error) {
      console.error(`❌ [Email] Alert to ${toEmail} failed:`, error);
      return false;
    }
  }

  /** Sends through Brevo's transactional email API (HTTPS, port 443) */
  private static async sendViaBrevoApi(toEmail: string, subject: string, text: string, html: string): Promise<boolean> {
    // SMTP_FROM looks like "Name <address>"; the sender address must be verified in Brevo
    const match = ENV.SMTP_FROM.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
    const sender = match ? { name: match[1].trim() || undefined, email: match[2].trim() } : { email: ENV.SMTP_FROM.trim() };

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": ENV.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender, to: [{ email: toEmail }], subject, textContent: text, htmlContent: html }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        console.error(`❌ [BREVO API ERROR] ${res.status} sending to ${toEmail}: ${await res.text()}`);
        return false;
      }

      const body = (await res.json()) as { messageId?: string };
      console.log(`✉️ [BREVO API SUCCESS] Sent OTP to ${toEmail}. Message ID: ${body.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ [BREVO API ERROR] Failed to send email to ${toEmail}:`, error);
      return false;
    }
  }
}
