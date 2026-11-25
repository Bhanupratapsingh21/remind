import dotenv from "dotenv";
import path from "path";

// Load from backend folder explicitly, fallback to cwd
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3001",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "super_secret_jwt_key_remind_app_2026_change_in_prod",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development",

  // Brevo SMTP Config
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "Eavara OTP <eavara@bpss.tech>",
  // Brevo API key (xkeysib-...). When set, email goes over HTTPS instead of SMTP
  BREVO_API_KEY: process.env.BREVO_API_KEY || "",
  // Where to email operational alerts (e.g. the phone carrier refusing calls). Optional.
  ADMIN_ALERT_EMAIL: process.env.ADMIN_ALERT_EMAIL || "",
  // Number shown to users as "we'll call you from". Defaults to the Vapi phone number (VAPI_PHONE_NUMBER_ID).
  CALLER_ID_NUMBER: process.env.CALLER_ID_NUMBER || "",

  // Dodo Payments. Optional: without the API key the billing routes answer 503 and the app keeps running.
  DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY || "",
  DODO_PAYMENTS_WEBHOOK_KEY: process.env.DODO_PAYMENTS_WEBHOOK_KEY || "",
  // "test_mode" (test.dodopayments.com) or "live_mode" (live.dodopayments.com)
  // The key decides: dodo_live_ keys only work on live.dodopayments.com, dodo_test_ keys only on test.
  // DODO_ENVIRONMENT is used only when the key has neither prefix.
  DODO_ENVIRONMENT: (process.env.DODO_PAYMENTS_API_KEY || "").startsWith("dodo_live")
    ? "live_mode"
    : (process.env.DODO_PAYMENTS_API_KEY || "").startsWith("dodo_test")
    ? "test_mode"
    : process.env.DODO_ENVIRONMENT === "live_mode"
    ? "live_mode"
    : "test_mode",
  DODO_PRODUCT_BASIC: process.env.DODO_PRODUCT_BASIC || "",
  DODO_PRODUCT_PRO: process.env.DODO_PRODUCT_PRO || "",

  // Redis & BullMQ
  REDIS_URL: process.env.REDIS_URL || "",
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

  // Vapi AI & Telephony
  VAPI_API_KEY: process.env.VAPI_API_KEY || "",
  VAPI_ASSISTANT_ID: process.env.VAPI_ASSISTANT_ID || "",
  VAPI_PHONE_NUMBER_ID: process.env.VAPI_PHONE_NUMBER_ID || "",
  VAPI_BASE_URL: process.env.VAPI_BASE_URL || "https://api.vapi.ai",
  VAPI_MOCK_CALLS: process.env.VAPI_MOCK_CALLS === "true" || !process.env.VAPI_API_KEY,
  // Shared secret Vapi sends as the x-vapi-secret header on every webhook
  VAPI_WEBHOOK_SECRET: process.env.VAPI_WEBHOOK_SECRET || "",

  // Vobiz Telephony
  VOBIZ_AUTH_ID: process.env.VOBIZ_AUTH_ID || "",
  VOBIZ_AUTH_TOKEN: process.env.VOBIZ_AUTH_TOKEN || "",

  // App & Webhooks
  // Render sets RENDER_EXTERNAL_URL to the service's public https URL
  WEBHOOK_BASE_URL: process.env.WEBHOOK_BASE_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5000",
  APP_TIMEZONE: process.env.APP_TIMEZONE || "Asia/Kolkata",

  // Abuse / cost guard: outbound calls placed per user per rolling 24 hours
  MAX_CALLS_PER_USER_PER_DAY: process.env.MAX_CALLS_PER_USER_PER_DAY
    ? parseInt(process.env.MAX_CALLS_PER_USER_PER_DAY, 10)
    : 20,
};

/**
 * Production config problems that would make the app silently not work.
 * Returns human-readable messages; empty when the config is usable.
 */
export const getProductionConfigErrors = (): string[] => {
  const errors: string[] = [];
  const webhookBase = ENV.WEBHOOK_BASE_URL.toLowerCase();

  if (!process.env.DATABASE_URL) errors.push("DATABASE_URL is not set.");
  if (!process.env.JWT_SECRET) errors.push("JWT_SECRET is not set (the built-in default is public).");
  if (!ENV.REDIS_URL && !process.env.REDIS_HOST) {
    errors.push("REDIS_URL is not set. The reminder scheduler needs Redis.");
  }
  if (ENV.VAPI_MOCK_CALLS) {
    errors.push("Calls are in mock mode (VAPI_API_KEY empty or VAPI_MOCK_CALLS=true); no real call would be placed.");
  } else {
    if (!ENV.VAPI_PHONE_NUMBER_ID) errors.push("VAPI_PHONE_NUMBER_ID is not set.");
    if (!ENV.VAPI_WEBHOOK_SECRET) errors.push("VAPI_WEBHOOK_SECRET is not set; every Vapi webhook would be rejected.");
    if (
      !webhookBase.startsWith("https://") ||
      webhookBase.includes("localhost") ||
      webhookBase.includes("your-public")
    ) {
      errors.push(`WEBHOOK_BASE_URL must be the backend's public https origin (now "${ENV.WEBHOOK_BASE_URL}").`);
    }
  }
  if (ENV.CLIENT_URL.includes("localhost")) {
    errors.push(`CLIENT_URL must be the frontend's public origin (now "${ENV.CLIENT_URL}").`);
  }
  return errors;
};

