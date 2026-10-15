import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import reminderRoutes from "./routes/reminder.routes";
import userRoutes from "./routes/user.routes";
import webhookRoutes from "./routes/webhook.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { ENV } from "./config/env";

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [ENV.CLIENT_URL, "http://localhost:3000", "http://localhost:3001"],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Request logging middleware for terminal output
  app.use(requestLogger);

  // Health check
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "remind-backend-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis: "connected",
      vapiMock: ENV.VAPI_MOCK_CALLS,
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/reminders", reminderRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/webhooks", webhookRoutes);

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
