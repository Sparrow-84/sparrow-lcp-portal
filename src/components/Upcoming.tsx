import { EVENT_LABEL, type LcpEvent } from '@/lib/types';
import { dayLabel, timeLabel } from '@/lib/format';

export function Upcoming({ events }: { events: LcpEvent[] }) {
  return (
    <section className="card">
      <h2 className="font-serif text-lg font-semibold">Upcoming</h2>

      {events.length === 0 ? (
        <p className="mt-3 text-sm text-sparrow-gray">No events scheduled yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {events.map((ev) => (
            <li key={ev.id} className="flex items-center gap-3 rounded-xl border border-sparrow-rule/70 p-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sparrow-sage text-center leading-none">
                <span className="text-[10px] font-medium uppercase text-sparrow-green">
                  {dayLabel(ev.starts_at).split(',')[0]}
                </span>
                <span className="text-sm font-semibold text-sparrow-green">{timeLabel(ev.starts_at)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sparrow-ink">{ev.title}</p>
                <p className="truncate text-xs text-sparrow-gray">
                  {EVENT_LABEL[ev.kind]}
                  {ev.location ? ` · ${ev.location}` : ''}
                </p>
              </div>
              {ev.mandatory ? (
                <span className="rounded-full bg-sparrow-green/10 px-2 py-0.5 text-[10px] font-medium text-sparrow-green">
                  Required
                </span>
              ) : ev.rsvp_enabled ? (
                <span className="rounded-full bg-sparrow-gold/15 px-2 py-0.5 text-[10px] font-medium text-sparrow-gold">
                  RSVP
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
