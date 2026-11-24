import axios from "axios";
import { Webhook } from "standardwebhooks";
import prisma from "../../config/db";
import { ENV } from "../../config/env";
import { redisClient } from "../../config/redis";
import { PaidPlan, isPaidPlan, planForProduct, productIdFor } from "./plans";

export class BillingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Subscription statuses that keep a paid plan switched on */
const ACCESS_STATUSES = new Set(["active"]);

const dodoHttp = () =>
  axios.create({
    baseURL: ENV.DODO_ENVIRONMENT === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com",
    headers: { Authorization: `Bearer ${ENV.DODO_PAYMENTS_API_KEY}`, "Content-Type": "application/json" },
    timeout: 15000,
  });

const describe = (error: any) => JSON.stringify(error?.response?.data || error?.message || error);

export class BillingService {
  static get enabled(): boolean {
    return !!(ENV.DODO_PAYMENTS_API_KEY && ENV.DODO_PRODUCT_BASIC && ENV.DODO_PRODUCT_PRO);
  }

  /**
   * Start a purchase. New subscribers get a hosted Dodo checkout URL; an active subscriber switching
   * between Basic and Pro is moved with a prorated plan change instead of a second subscription.
   */
  static async startCheckout(userId: string, plan: PaidPlan): Promise<{ checkoutUrl?: string; changed?: boolean }> {
    if (!this.enabled) throw new BillingError("Payments are not set up yet.", 503);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BillingError("User not found", 404);

    const hasActiveSub = !!user.subscriptionId && ACCESS_STATUSES.has(user.subscriptionStatus || "");
    if (hasActiveSub) {
      if (user.plan === plan) throw new BillingError(`You're already on ${plan === "PRO" ? "Pro" : "Basic"}.`);
      try {
        await dodoHttp().post(`/subscriptions/${user.subscriptionId}/change-plan`, {
          product_id: productIdFor(plan),
          quantity: 1,
          proration_billing_mode: "prorated_immediately",
        });
      } catch (error) {
        console.error("❌ [Billing] Plan change failed:", describe(error));
        throw new BillingError("Could not change your plan. Please try again.", 502);
      }
      // The plan itself flips when the subscription.plan_changed webhook arrives
      return { changed: true };
    }

    try {
      const { data } = await dodoHttp().post("/checkouts", {
        product_cart: [{ product_id: productIdFor(plan), quantity: 1 }],
        customer: user.dodoCustomerId ? { customer_id: user.dodoCustomerId } : { email: user.email, name: user.name },
        billing_address: { country: "IN" },
        billing_currency: "INR",
        return_url: `${ENV.CLIENT_URL.replace(/\/$/, "")}/dashboard?billing=success`,
        metadata: { userId: user.id, plan },
      });
      if (!data?.checkout_url) throw new Error(`No checkout_url in response: ${JSON.stringify(data)}`);
      return { checkoutUrl: data.checkout_url };
    } catch (error) {
      console.error("❌ [Billing] Checkout session failed:", describe(error));
      throw new BillingError("Could not start checkout. Please try again.", 502);
    }
  }

  /** Cancel at the end of the paid period; access continues until then */
  static async cancel(userId: string): Promise<void> {
    if (!this.enabled) throw new BillingError("Payments are not set up yet.", 503);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.subscriptionId) throw new BillingError("You don't have an active subscription.");

    try {
      await dodoHttp().patch(`/subscriptions/${user.subscriptionId}`, { cancel_at_next_billing_date: true });
    } catch (error) {
      console.error("❌ [Billing] Cancel failed:", describe(error));
      throw new BillingError("Could not cancel. Please try again.", 502);
    }
    await prisma.user.update({ where: { id: userId }, data: { cancelAtPeriodEnd: true } });
  }

  /**
   * Verify and apply a Dodo webhook. Returns false when the signature is invalid.
   * Uses the subscription's own status as the source of truth, so event order doesn't matter much.
   */
  static async handleWebhook(rawBody: string, headers: Record<string, string>): Promise<boolean> {
    if (!ENV.DODO_PAYMENTS_WEBHOOK_KEY) {
      console.error("❌ [Billing] DODO_PAYMENTS_WEBHOOK_KEY is not set; rejecting webhook");
      return false;
    }

    let event: any;
    try {
      event = new Webhook(ENV.DODO_PAYMENTS_WEBHOOK_KEY).verify(rawBody, headers);
    } catch {
      return false;
    }

    // Dodo retries deliveries; process each webhook-id once
    const webhookId = headers["webhook-id"];
    if (webhookId) {
      const first = await redisClient.set(`dodo:webhook:${webhookId}`, "1", "EX", 7 * 24 * 3600, "NX");
      if (!first) return true;
    }

    const type: string = event?.type || "";
    const data = event?.data || {};
    console.log(
      `💳 [Billing] ${type} sub=${data.subscription_id} status=${data.status} product=${data.product_id} ` +
        `customer=${data.customer?.customer_id} next=${data.next_billing_date} cancelAtEnd=${data.cancel_at_next_billing_date}`
    );

    if (!type.startsWith("subscription.") || !data.subscription_id) return true;

    const metaUserId = data.metadata?.userId;
    const user =
      (metaUserId && (await prisma.user.findUnique({ where: { id: String(metaUserId) } }))) ||
      (await prisma.user.findFirst({ where: { subscriptionId: data.subscription_id } })) ||
      (data.customer?.email && (await prisma.user.findUnique({ where: { email: String(data.customer.email).toLowerCase() } })));

    if (!user) {
      console.error(`❌ [Billing] No user for subscription ${data.subscription_id} (${type})`);
      return true;
    }

    // An event for an older subscription must not overwrite a newer active one
    if (user.subscriptionId && user.subscriptionId !== data.subscription_id && ACCESS_STATUSES.has(user.subscriptionStatus || "")) {
      if (!ACCESS_STATUSES.has(data.status)) return true;
    }

    const plan = planForProduct(data.product_id) || (isPaidPlan(data.metadata?.plan) ? data.metadata.plan : null);
    const hasAccess = ACCESS_STATUSES.has(data.status) && !!plan;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: hasAccess ? plan! : "TRIAL",
        subscriptionId: data.subscription_id,
        subscriptionStatus: data.status || null,
        subscriptionProductId: data.product_id || null,
        dodoCustomerId: data.customer?.customer_id || user.dodoCustomerId,
        currentPeriodEnd: data.next_billing_date ? new Date(data.next_billing_date) : null,
        cancelAtPeriodEnd: !!data.cancel_at_next_billing_date,
      },
    });
    console.log(`💳 [Billing] ${user.email} -> plan ${hasAccess ? plan : "TRIAL"} (${data.status})`);
    return true;
  }
}
