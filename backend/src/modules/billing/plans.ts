import { ENV } from "../../config/env";

/** Active-reminder limits per paid plan (PRO is unlimited) */
export const PLAN_LIMITS = { BASIC: 3 } as const;

/** Reminders a user without a subscription may create, ever (the "one free test call") */
export const FREE_TEST_REMINDERS = 1;

export type PaidPlan = "BASIC" | "PRO";

export function isPaidPlan(plan?: string | null): plan is PaidPlan {
  return plan === "BASIC" || plan === "PRO";
}

/** Dodo product id for each plan; prices (₹199 / ₹499 a month) are set on the products in Dodo */
export function productIdFor(plan: PaidPlan): string {
  return plan === "BASIC" ? ENV.DODO_PRODUCT_BASIC : ENV.DODO_PRODUCT_PRO;
}

export function planForProduct(productId?: string | null): PaidPlan | null {
  if (!productId) return null;
  if (productId === ENV.DODO_PRODUCT_BASIC) return "BASIC";
  if (productId === ENV.DODO_PRODUCT_PRO) return "PRO";
  return null;
}
