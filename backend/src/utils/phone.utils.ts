import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Normalise a user-entered phone number to E.164 (e.g. "+91 98765 43210" -> "+919876543210").
 * Vapi rejects any other format. Returns null if the number is not valid.
 */
export const toE164 = (raw: string): string | null => {
  const cleaned = raw.trim().replace(/[^\d+]/g, "");
  const parsed = parsePhoneNumberFromString(cleaned.startsWith("+") ? cleaned : `+${cleaned}`);
  if (!parsed || !parsed.isValid()) {
    return null;
  }
  return parsed.number;
};
