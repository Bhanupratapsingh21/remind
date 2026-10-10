/**
 * Timezone and calling hours helper utilities
 */

export interface CallingHoursCheckResult {
  isAllowed: boolean;
  currentLocalTime: string; // "HH:mm"
  nextAllowedDate?: Date;
  reason?: string;
}

export interface LocalTimeInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timeStr: string;
  dateStr: string;
}

/**
 * Get current time in target timezone as { hours, minutes, dateStr, timeStr }
 */
export const getLocalTimeInfo = (date: Date, timeZone: string): LocalTimeInfo => {

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "00";

    const year = parseInt(getPart("year"), 10);
    const month = parseInt(getPart("month"), 10);
    const day = parseInt(getPart("day"), 10);
    const hour = parseInt(getPart("hour"), 10);
    const minute = parseInt(getPart("minute"), 10);

    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    return { year, month, day, hour, minute, timeStr, dateStr };
  } catch (error) {
    // Fallback to UTC if invalid timezone
    console.warn(`Invalid timezone "${timeZone}". Falling back to UTC.`);
    return getLocalTimeInfo(date, "UTC");
  }
};

/**
 * Check if the given date falls within user's allowed calling hours
 * e.g. callingStartTime = "08:00", callingEndTime = "22:00"
 */
export const checkCallingHours = (
  date: Date = new Date(),
  timeZone: string = "Asia/Kolkata",
  callingStartTime: string = "08:00",
  callingEndTime: string = "22:00"
): CallingHoursCheckResult => {
  const local = getLocalTimeInfo(date, timeZone);
  const currentLocalMinutes = local.hour * 60 + local.minute;

  const [startHour, startMin] = callingStartTime.split(":").map(Number);
  const [endHour, endMin] = callingEndTime.split(":").map(Number);

  const startMinutes = startHour * 60 + (startMin || 0);
  const endMinutes = endHour * 60 + (endMin || 0);

  // Simple daytime window: e.g. 08:00 to 22:00
  if (startMinutes <= endMinutes) {
    if (currentLocalMinutes >= startMinutes && currentLocalMinutes < endMinutes) {
      return {
        isAllowed: true,
        currentLocalTime: local.timeStr,
      };
    }

    // Outside window
    let nextDate = new Date(date);
    if (currentLocalMinutes < startMinutes) {
      // It's earlier today, delay to startMinutes today
      const diffMs = (startMinutes - currentLocalMinutes) * 60 * 1000;
      nextDate = new Date(date.getTime() + diffMs);
    } else {
      // It's later today, delay to startMinutes tomorrow
      const diffMs = (24 * 60 - currentLocalMinutes + startMinutes) * 60 * 1000;
      nextDate = new Date(date.getTime() + diffMs);
    }

    return {
      isAllowed: false,
      currentLocalTime: local.timeStr,
      nextAllowedDate: nextDate,
      reason: `Current local time (${local.timeStr}) is outside allowed calling hours (${callingStartTime} - ${callingEndTime}).`,
    };
  }

  // Overnight window: e.g. 20:00 to 06:00
  const isAllowed = currentLocalMinutes >= startMinutes || currentLocalMinutes < endMinutes;
  return {
    isAllowed,
    currentLocalTime: local.timeStr,
    nextAllowedDate: isAllowed ? undefined : new Date(date.getTime() + 60 * 60 * 1000),
  };
};
