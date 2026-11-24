/** Paid plans. Limits must match backend/src/modules/billing/plans.ts; prices are set on the Dodo products. */
export type PlanId = "BASIC" | "PRO";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  tagline: string;
  limit: string;
  features: string[];
  highlight: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: "₹199",
    period: "per month",
    tagline: "For the few things you can't afford to forget.",
    limit: "3 active reminders",
    features: [
      "3 active reminders at a time",
      "AI phone call at the exact time",
      "Talk back: done, snooze or cancel",
      "Automatic retries if you miss it",
      "Create reminders by voice, mid-call",
      "All 5 voices and 5 call styles",
      "Calling hours and call transcripts",
    ],
    highlight: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹499",
    period: "per month",
    tagline: "For daily routines, habits and a busy calendar.",
    limit: "Unlimited reminders",
    features: [
      "Unlimited active reminders",
      "Everything in Basic",
      "Ideal for medicines, workouts and daily habits",
      "Switch plans or cancel anytime",
    ],
    highlight: true,
  },
];

/** What a new account gets before paying */
export const FREE_TEST_NOTE = "Every new account gets one free test call. No card needed to try it.";

export function planLabel(plan?: string | null): string {
  if (plan === "PRO") return "Pro";
  if (plan === "BASIC") return "Basic";
  return "Free test";
}
