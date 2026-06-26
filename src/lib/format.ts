export function money(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** "due Today" / "due Fri, Jun 12" / "" when no date. */
export function dueLabel(iso: string | null): string {
  if (!iso) return '';
  return `due ${dayLabel(iso)}`;
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

/** Sunday midnight of the current week — default due date when none is set. */
export function defaultDueDate(): Date {
  const now = new Date();
  const sun = new Date(now);
  sun.setDate(now.getDate() + (7 - now.getDay()) % 7 || 7); // this Sunday or next if today is Mon-Sat
  // If today IS Sunday, items are due tonight.
  if (now.getDay() === 0) sun.setDate(now.getDate());
  sun.setHours(23, 59, 59, 999);
  return sun;
}

/** "Week of Jun 8" label from Sunday of the current week. */
export function weekOfLabel(): string {
  const now = new Date();
  const sun = new Date(now);
  sun.setDate(now.getDate() - now.getDay());
  return `Week of ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function shortDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
