/** Shared rules for the create / edit reminder form. Keep in sync with backend reminder.service.ts */
export const MIN_LEAD_MINUTES = 2;

export type RepeatRule = "DAILY" | "WEEKDAYS" | "WEEKLY";

export const REPEAT_OPTIONS: { value: "NONE" | RepeatRule; label: string }[] = [
  { value: "NONE", label: "Does not repeat" },
  { value: "DAILY", label: "Every day" },
  { value: "WEEKDAYS", label: "Weekdays (Mon–Fri)" },
  { value: "WEEKLY", label: "Every week" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Browser-local "YYYY-MM-DD" and "HH:mm" for a date */
export function toLocalInputs(d: Date): { date: string; time: string } {
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** A sensible default for a new reminder: 15 minutes from now, rounded up to the next 5 minutes */
export function defaultSlot(): { date: string; time: string } {
  const d = new Date(Date.now() + 15 * 60_000);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  return toLocalInputs(d);
}

export function describeRepeat(rule?: string | null, weekday?: number | null): string {
  if (rule === "DAILY") return "Repeats daily";
  if (rule === "WEEKDAYS") return "Repeats on weekdays";
  if (rule === "WEEKLY") {
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return `Repeats every ${names[weekday ?? 0]}`;
  }
  return "";
}
