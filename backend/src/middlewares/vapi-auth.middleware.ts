import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { ENV } from "../config/env";

const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Verify the shared secret Vapi sends with every webhook (configured via assistant.server.headers).
 * In production the secret is mandatory.
 */
export const verifyVapiSecret = (req: Request, res: Response, next: NextFunction): void => {
  if (!ENV.VAPI_WEBHOOK_SECRET) {
    if (ENV.NODE_ENV === "production") {
      console.error("❌ [Vapi Webhook] VAPI_WEBHOOK_SECRET is not set; rejecting webhook.");
      res.status(503).json({ success: false, message: "Webhook secret not configured" });
      return;
    }
    next();
    return;
  }

  const provided = req.header("x-vapi-secret") || "";
  if (!safeEqual(provided, ENV.VAPI_WEBHOOK_SECRET)) {
    res.status(401).json({ success: false, message: "Invalid webhook secret" });
    return;
  }
  next();
};

/**
 * Development-only routes (call outcome simulator)
 */
export const devOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (ENV.NODE_ENV === "production") {
    res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.url} not found` });
    return;
  }
  next();
};
