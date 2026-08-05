import { useEffect, useMemo, useState } from 'react';
import { getFamilyCalendarEvents } from '@/lib/lcp';
import type { FamilyCalendarEvent } from '@/lib/types';
import { timeLabel } from '@/lib/format';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Only ever shows name/date/time -- fetch_lcp_family_calendar_events (staff
// side) never returns anything else, by design, not by client filtering.
export function CalendarView() {
  const [events, setEvents] = useState<FamilyCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    getFamilyCalendarEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, FamilyCalendarEvent[]>();
    for (const ev of events) {
      const key = dayKey(new Date(ev.starts_at));
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const startWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayKey = dayKey(new Date());

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function changeMonth(delta: number) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
    setSelectedDay(null);
  }

  const selectedEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : [];

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="rounded-lg px-2 py-1 text-sparrow-gray hover:bg-sparrow-mist"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-sparrow-ink">
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="rounded-lg px-2 py-1 text-sparrow-gray hover:bg-sparrow-mist"
          >
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-sparrow-gray">Loading…</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-sparrow-gray">
            {WEEKDAY_LABELS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day == null) return <span key={i} />;
              const key = `${year}-${monthIndex}-${day}`;
              const dayEvents = eventsByDay.get(key) ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDay;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(dayEvents.length > 0 ? key : null)}
                  className={`flex flex-col items-center rounded-lg py-1.5 text-sm transition ${
                    isSelected
                      ? 'bg-sparrow-green text-white'
                      : isToday
                        ? 'bg-sparrow-sage font-semibold text-sparrow-green'
                        : 'text-sparrow-ink hover:bg-sparrow-mist'
                  }`}
                >
                  {day}
                  {dayEvents.length > 0 && (
                    <span className={`mt-0.5 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-sparrow-gold'}`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-sparrow-rule pt-3">
            {selectedDay ? (
              selectedEvents.length === 0 ? (
                <p className="text-sm text-sparrow-gray">Nothing this day.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedEvents.map((ev) => (
                    <li key={ev.id} className="flex items-center gap-3 rounded-xl border border-sparrow-rule/70 p-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sparrow-sage text-center leading-none">
                        <span className="text-sm font-semibold text-sparrow-green">{timeLabel(ev.starts_at)}</span>
                      </div>
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-sparrow-ink">{ev.title}</p>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-sm text-sparrow-gray">Tap a day with a dot to see what's happening.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
