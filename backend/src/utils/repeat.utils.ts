/**
 * Repeating reminders: work out the next occurrence in the reminder's own timezone.
 */
export const REPEAT_RULES = ["DAILY", "WEEKDAYS", "WEEKLY"] as const;
export type RepeatRule = (typeof REPEAT_RULES)[number];

export function isRepeatRule(value: unknown): value is RepeatRule {
  return typeof value === "string" && (REPEAT_RULES as readonly string[]).includes(value);
}

interface LocalParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = Sunday
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Wall-clock parts of `date` in `timeZone` */
export function localParts(date: Date, timeZone: string): LocalParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const get = (type: string) => fmt.formatToParts(date).find((p) => p.type === type)?.value || "0";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: WEEKDAYS[get("weekday")] ?? 0,
  };
}

/** The UTC instant at which the wall clock in `timeZone` reads y-m-d h:mi */
export function localToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const offsetAt = (ms: number) => {
    const p = localParts(new Date(ms), timeZone);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(ms / 60000) * 60000;
  };
  let result = guess - offsetAt(guess);
  // Second pass settles DST edges
  result = guess - offsetAt(result);
  return new Date(result);
}

/** Repeat settings derived from the first occurrence's time */
export function repeatFieldsFor(rule: RepeatRule, scheduledAt: Date, timeZone: string) {
  const p = localParts(scheduledAt, timeZone);
  return {
    repeat: rule,
    repeatTime: `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`,
    repeatWeekday: rule === "WEEKLY" ? p.weekday : null,
  };
}

/**
 * First occurrence strictly after `after` (plus a 1-minute margin), at `repeatTime` local time,
 * on a day the rule allows. Returns null when the settings are incomplete.
 */
export function nextOccurrence(
  rule: string | null | undefined,
  repeatTime: string | null | undefined,
  repeatWeekday: number | null | undefined,
  timeZone: string,
  after: Date = new Date()
): Date | null {
  if (!isRepeatRule(rule) || !repeatTime) return null;
  const [hour, minute] = repeatTime.split(":").map(Number);
  const start = localParts(after, timeZone);
  const minTime = after.getTime() + 60_000;

  for (let offset = 0; offset <= 8; offset++) {
    // Walk calendar days in the local timezone (noon avoids DST jumps when stepping)
    const noon = localToUtc(start.year, start.month, start.day, 12, 0, timeZone);
    const day = localParts(new Date(noon.getTime() + offset * 24 * 3600_000), timeZone);
    if (rule === "WEEKDAYS" && (day.weekday === 0 || day.weekday === 6)) continue;
    if (rule === "WEEKLY" && day.weekday !== repeatWeekday) continue;
    const candidate = localToUtc(day.year, day.month, day.day, hour, minute, timeZone);
    if (candidate.getTime() > minTime) return candidate;
  }
  return null;
}

/** "Daily", "Weekdays", "Weekly on Monday" */
export function describeRepeat(rule: string | null | undefined, weekday?: number | null): string {
  if (rule === "DAILY") return "Daily";
  if (rule === "WEEKDAYS") return "Weekdays";
  if (rule === "WEEKLY") {
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return `Weekly on ${names[weekday ?? 0]}`;
  }
  return "Does not repeat";
}
