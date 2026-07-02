import { type LcpEvent } from '@/lib/types';
import { shortDayLabel, timeLabel } from '@/lib/format';

export function EventDetail({
  event,
  onBack,
  onOpenMessages,
  prefillDraft,
}: {
  event: LcpEvent;
  onBack: () => void;
  onOpenMessages: (draft: string) => void;
  prefillDraft: (event: LcpEvent) => string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-sparrow-rule px-4 py-3">
        <button onClick={onBack} className="text-sm font-medium text-sparrow-green">
          ← Back
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          {event.mandatory && (
            <span className="rounded-full bg-sparrow-green/10 px-2 py-0.5 text-xs font-medium text-sparrow-green">
              Required
            </span>
          )}
          {event.rsvp_enabled && !event.mandatory && (
            <span className="rounded-full bg-sparrow-gold/15 px-2 py-0.5 text-xs font-medium text-sparrow-gold">
              RSVP
            </span>
          )}
        </div>

        <h1 className="mt-2 font-serif text-xl font-semibold text-sparrow-ink">{event.title}</h1>

        <div className="mt-3 space-y-1 text-sm text-sparrow-gray">
          <p>{shortDayLabel(event.starts_at)} · {timeLabel(event.starts_at)}</p>
          {event.location && <p>{event.location}</p>}
        </div>
      </div>

      {event.mandatory && (
        <div className="mt-auto border-t border-sparrow-rule px-4 py-4">
          <p className="text-xs text-sparrow-gray">Can't make it?</p>
          <button
            onClick={() => onOpenMessages(prefillDraft(event))}
            className="mt-1 text-sm text-sparrow-gray underline-offset-2 hover:underline"
          >
            Let your LifeChange team know →
          </button>
        </div>
      )}
    </div>
  );
}

export function buildCantMakeitDraft(event: LcpEvent): string {
  const day = shortDayLabel(event.starts_at);
  return `Hi — I won't be able to make ${event.title} on ${day}. Here's why: `;
}
