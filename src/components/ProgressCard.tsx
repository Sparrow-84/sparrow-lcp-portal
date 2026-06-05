import { TOTAL_SESSIONS, type CurrentSession, type Family } from '@/lib/types';
import { money } from '@/lib/format';

export function ProgressCard({ family, session }: { family: Family; session: CurrentSession | null }) {
  const pct = Math.min(100, Math.round((family.current_session_number / TOTAL_SESSIONS) * 100));
  const phaseName = session?.unit?.phase?.name ?? '—';
  const unitName = session?.unit?.name ?? '';

  return (
    <section className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-sparrow-gold">Building Your House</p>
      <h2 className="mt-1 font-serif text-xl font-semibold text-sparrow-green">{phaseName}</h2>
      <p className="text-sm text-sparrow-gray">
        {unitName ? `${unitName} · ` : ''}Session {family.current_session_number} of {TOTAL_SESSIONS}
      </p>

      <div className="mt-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-sparrow-sage">
          <div
            className="h-full rounded-full bg-sparrow-green transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs font-medium text-sparrow-green">{pct}% complete</p>
      </div>

      {family.housing_savings_cents > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-sparrow-cream px-4 py-3">
          <span className="text-sm text-sparrow-ink">🏡 Housing savings earned</span>
          <span className="font-serif text-lg font-semibold text-sparrow-green">
            {money(family.housing_savings_cents)}
          </span>
        </div>
      )}
    </section>
  );
}
