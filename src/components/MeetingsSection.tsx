import { type LcpEvent } from '@/lib/types';
import { shortDayLabel, timeLabel } from '@/lib/format';

export function MeetingsSection({
  events,
  onEventTap,
}: {
  events: LcpEvent[];
  onEventTap: (event: LcpEvent) => void;
}) {
  if (events.length === 0) return null;

  return (
    <section className="card">
      <h2 className="font-serif text-lg font-semibold">Meetings This Week</h2>
      <ul className="mt-3 divide-y divide-sparrow-rule/50">
        {events.map((ev) => (
          <li key={ev.id}>
            <button
              onClick={() => onEventTap(ev)}
              className="flex w-full items-center gap-3 py-3 text-left active:bg-sparrow-mist"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-sparrow-ink">{ev.title}</p>
                  {ev.mandatory && (
                    <span className="rounded-full bg-sparrow-green/10 px-2 py-0.5 text-[10px] font-medium text-sparrow-green">
                      Required
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-sparrow-gray">
                  {shortDayLabel(ev.starts_at)} · {timeLabel(ev.starts_at)}
                  {ev.location ? ` · ${ev.location}` : ''}
                </p>
              </div>
              <span className="text-xs text-sparrow-gray">›</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
