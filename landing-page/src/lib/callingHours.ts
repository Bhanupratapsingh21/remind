/**
 * Mirrors backend checkCallingHours (backend/src/utils/timezone.utils.ts): a reminder due outside the
 * user's calling hours is held by the worker until the window next opens.
 */
export interface CallingHours {
  start: string; // "08:00"
  end: string; // "22:00"
  timeZone: string;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

function localMinutes(date: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
    const h = Number(parts.find((p) => p.type === "hour")?.value);
    const m = Number(parts.find((p) => p.type === "minute")?.value);
    return h * 60 + m;
  } catch {
    return date.getHours() * 60 + date.getMinutes();
  }
}

/** When the call will actually ring: `null` if `date` is inside calling hours, otherwise the held time */
export function heldUntil(date: Date, hours: CallingHours): Date | null {
  const now = localMinutes(date, hours.timeZone);
  const start = toMinutes(hours.start);
  const end = toMinutes(hours.end);

  if (start <= end) {
    if (now >= start && now < end) return null;
    const wait = now < start ? start - now : 24 * 60 - now + start;
    return new Date(date.getTime() + wait * 60_000);
  }
  // Overnight window, e.g. 20:00 to 06:00
  if (now >= start || now < end) return null;
  return new Date(date.getTime() + (start - now) * 60_000);
}

/** "8:00 AM" or "tomorrow, 8:00 AM", in the user's timezone */
export function describeCallTime(target: Date, from: Date, timeZone: string): string {
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => {
    try {
      return new Intl.DateTimeFormat(undefined, { timeZone, ...o }).format(d);
    } catch {
      return new Intl.DateTimeFormat(undefined, o).format(d);
    }
  };
  const time = fmt(target, { hour: "numeric", minute: "2-digit" });
  const day = (d: Date) => fmt(d, { year: "numeric", month: "2-digit", day: "2-digit" });
  if (day(target) === day(from)) return time;
  const nextDay = new Date(from.getTime() + 24 * 3600_000);
  if (day(target) === day(nextDay)) return `next morning, ${time}`;
  return `${fmt(target, { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
}

/** "8:00 AM – 10:00 PM" */
export function formatHours(hours: CallingHours): string {
  const f = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date(2000, 0, 1, h || 0, m || 0);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };
  return `${f(hours.start)} – ${f(hours.end)}`;
}
