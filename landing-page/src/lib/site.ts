/** Public site details used by metadata, sitemap, robots and structured data */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://remind.bpss.in").replace(/\/$/, "");
export const SITE_NAME = "Remind";
export const SITE_TITLE = "Remind: an AI that calls you so you don't forget";
export const SITE_DESCRIPTION =
  "Remind phones you at the exact time you set. Talk back to mark it done, snooze it or cancel it. Natural Indian and American voices, Hinglish support, automatic retries. Plans from ₹199/month.";
