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

  // Vobiz Telephony
  VOBIZ_AUTH_ID: process.env.VOBIZ_AUTH_ID || "",
  VOBIZ_AUTH_TOKEN: process.env.VOBIZ_AUTH_TOKEN || "",

  // App & Webhooks
  WEBHOOK_BASE_URL: process.env.WEBHOOK_BASE_URL || "http://localhost:5000",
  APP_TIMEZONE: process.env.APP_TIMEZONE || "Asia/Kolkata",
};

