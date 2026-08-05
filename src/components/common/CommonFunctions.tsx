import dayjs from "dayjs";

/**
 * Formats a date string to a relative time string (e.g., "1m ago", "2h ago", "3d ago").
 * Returns "-" if the date string is null, undefined, or empty.
 *
 * @param dateString - The date string to format relative to now
 * @returns The formatted relative time-ago string
 */
export const formatLastUsed = (dateString: string | null): string => {
  if (!dateString) return "-";
  const d = dayjs(dateString);
  if (!d.isValid()) return dateString;
  const diffMins = dayjs().diff(d, "minute");
  if (diffMins < 1) return "1m ago";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = dayjs().diff(d, "hour");
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = dayjs().diff(d, "day");
  return `${diffDays}d ago`;
};

/**
 * Formats a date string into a standard date/time string with format: "DD/MM/YYYY, h:mm A".
 * Returns "-" if the date string is null, undefined, or empty.
 *
 * @param dateString - The date string to format
 * @returns The formatted string (e.g., "29/07/2026, 12:00 PM")
 */
export const formatExpiresOn = (dateString: string | null): string => {
  if (!dateString) return "-";
  const d = dayjs(dateString);
  if (!d.isValid()) return dateString;
  return d.format("DD/MM/YYYY, h:mm A");
};
