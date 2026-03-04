/**
 * Get the Monday of the week for a given date.
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the 7 dates (Mon–Sun) for a week starting on the given Monday.
 */
export function getWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/**
 * Format date as YYYY-MM-DD for use as a key.
 */
export function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Format date for display (e.g. "Mon 4" or "Mon Mar 4").
 */
export function formatDayLabel(date: Date, options?: { short?: boolean }): string {
  const name = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  if (options?.short) return `${name} ${day}`;
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `${name} ${month} ${day}`;
}

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
