import { Request, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { BillingError, BillingService } from "./billing.service";

const checkoutSchema = z.object({ plan: z.enum(["BASIC", "PRO"]) });

const fail = (res: Response, error: any) => {
  if (error instanceof BillingError) {
    res.status(error.status).json({ success: false, message: error.message });
    return;
  }
  console.error("❌ [Billing]", error);
  res.status(500).json({ success: false, message: "Something went wrong with billing." });
};

export class BillingController {
  /** POST /api/billing/checkout { plan } */
  static async checkout(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Choose Basic or Pro." });
      return;
    }
    try {
      const result = await BillingService.startCheckout(req.user!.id, parsed.data.plan);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      fail(res, error);
    }
  }

  /** POST /api/billing/cancel */
  static async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await BillingService.cancel(req.user!.id);
      res.status(200).json({ success: true, message: "Your plan will end at the close of this billing period." });
    } catch (error) {
      fail(res, error);
    }
  }

  /** POST /api/webhooks/dodo (raw body) */
  static async webhook(req: Request, res: Response): Promise<void> {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    const headers = {
      "webhook-id": String(req.headers["webhook-id"] || ""),
      "webhook-signature": String(req.headers["webhook-signature"] || ""),
      "webhook-timestamp": String(req.headers["webhook-timestamp"] || ""),
    };
    try {
      const ok = await BillingService.handleWebhook(raw, headers);
      res.status(ok ? 200 : 401).json({ received: ok });
    } catch (error) {
      console.error("❌ [Billing] Webhook processing failed:", error);
      res.status(500).json({ received: false });
    }
  }
}
