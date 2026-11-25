import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import reminderRoutes from "./routes/reminder.routes";
import userRoutes from "./routes/user.routes";
import webhookRoutes from "./routes/webhook.routes";
import billingRoutes from "./routes/billing.routes";
import { BillingController } from "./modules/billing/billing.controller";
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { ENV } from "./config/env";
import { redisClient } from "./config/redis";
import { VapiService } from "./modules/vapi/vapi.service";

/** "08065354620" or "918065354620" -> "+918065354620" (Indian numbers); other formats pass through */
const toDisplayE164 = (raw: string): string | null => {
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return null;
  if (digits.startsWith("+")) return digits;
  if (/^0\d{10}$/.test(digits)) return `+91${digits.slice(1)}`;
  if (/^91\d{10}$/.test(digits)) return `+${digits}`;
  if (/^\d{10}$/.test(digits)) return `+91${digits}`;
  return digits;
};

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [ENV.CLIENT_URL, "http://localhost:3000", "http://localhost:3001"],
      credentials: true,
    })
  );
  // Dodo signs the exact bytes it sends, so this route reads the raw body and must come before express.json()
  app.post("/api/webhooks/dodo", express.raw({ type: "*/*", limit: "1mb" }), BillingController.webhook);
  app.use(express.json());
  app.use(cookieParser());

  // Request logging middleware for terminal output
  app.use(requestLogger);

  // Health check
  app.get("/health", async (req: Request, res: Response) => {
    let redis = "disconnected";
    try {
      // ping() queues forever while disconnected (maxRetriesPerRequest: null), so cap the wait
      const pong = await Promise.race([
        redisClient.ping(),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
      ]);
      redis = pong === "PONG" ? "connected" : "unhealthy";
    } catch {
      // stays "disconnected"
    }

    const vapi = VapiService.setupStatus;
    const healthy = redis === "connected" && vapi.state !== "error";

    res.status(redis === "connected" ? 200 : 503).json({
      status: healthy ? "ok" : "degraded",
      service: "remind-backend-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis,
      vapiMock: ENV.VAPI_MOCK_CALLS,
      vapi,
    });
  });

  // Public app config for the dashboard: the number reminder calls come from, so users can save it
  app.get("/api/config", (req: Request, res: Response) => {
    const raw = ENV.CALLER_ID_NUMBER || VapiService.setupStatus.phoneNumber || "";
    res.json({ success: true, data: { callerNumber: toDisplayE164(raw), callerName: "Remind" } });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/reminders", reminderRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api/billing", billingRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.url} not found`,
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
