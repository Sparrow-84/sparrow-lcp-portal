import { useState } from 'react';
import { submitGoalResponse } from '@/lib/lcp';
import { GOAL_AREA_LABEL } from '@/lib/types';
import type { Goal, GoalResponse } from '@/lib/types';

function dueLabel(dateStr: string | null): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GoalsView({
  familyId,
  goals,
  goalResponses,
  onChanged,
}: {
  familyId: string;
  goals: Goal[];
  goalResponses: GoalResponse[];
  onChanged: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const active = goals.filter((g) => g.status === 'active');
  const met = goals.filter((g) => g.status === 'met');

  function latestResponse(goalId: string): GoalResponse | null {
    const rs = goalResponses.filter((r) => r.goal_id === goalId);
    if (!rs.length) return null;
    return rs.reduce((a, b) => (a.created_at > b.created_at ? a : b));
  }

  async function respond(goalId: string, response: 'met' | 'needs_time') {
    setBusy(true);
    await submitGoalResponse(goalId, familyId, response);
    setRespondingId(null);
    setBusy(false);
    onChanged();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">My Goals</h1>
        <p className="mt-1 text-sm text-sparrow-gray">
          Goals you set with your mentor. You can let them know how you're doing any time.
        </p>
      </div>

      {active.length === 0 && met.length === 0 && (
        <div className="card text-center">
          <p className="text-sm text-sparrow-gray">
            No goals set yet. Your mentor will add them after your first one-on-one.
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((goal) => {
            const isToday = goal.due_date === today;
            const isOverdue = goal.due_date !== null && goal.due_date < today;
            const latest = latestResponse(goal.id);
            const justResponded = latest && latest.created_at > goal.updated_at;
            const isOpen = respondingId === goal.id;

            return (
              <div
                key={goal.id}
                className={`card space-y-3 ${
                  isToday
                    ? 'border-sparrow-green/40 bg-sparrow-green/5'
                    : isOverdue
                    ? 'border-sparrow-gold/40 bg-sparrow-gold/5'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {isToday && (
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sparrow-green">
                        Due today
                      </p>
                    )}
                    {isOverdue && !isToday && (
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sparrow-gold">
                        Take a look when you're ready
                      </p>
                    )}
                    <p className="text-sm font-medium text-sparrow-ink">{goal.title}</p>
                    <p className="mt-0.5 text-xs text-sparrow-gray">
                      {GOAL_AREA_LABEL[goal.area]}
                      {goal.due_date && ` · ${dueLabel(goal.due_date)}`}
                    </p>
                  </div>
                </div>

                {justResponded && !isOpen && (
                  <p className="rounded-lg bg-sparrow-mist px-3 py-2 text-xs text-sparrow-gray">
                    {latest.response === 'met'
                      ? '✓ You let your mentor know you did this. Nice work.'
                      : '⚑ You let your mentor know you need more time. They'll follow up.'}
                  </p>
                )}

                {isOpen ? (
                  <div className="space-y-2">
                    <p className="text-sm text-sparrow-ink">How's it going with this goal?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respond(goal.id, 'met')}
                        disabled={busy}
                        className="flex-1 rounded-xl bg-sparrow-green px-3 py-2.5 text-sm font-medium text-white active:opacity-90"
                      >
                        I did it ✓
                      </button>
                      <button
                        onClick={() => respond(goal.id, 'needs_time')}
                        disabled={busy}
                        className="flex-1 rounded-xl border border-sparrow-rule px-3 py-2.5 text-sm font-medium text-sparrow-ink active:bg-sparrow-mist"
                      >
                        Need more time
                      </button>
                    </div>
                    <button
                      onClick={() => setRespondingId(null)}
                      className="w-full text-center text-xs text-sparrow-gray"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRespondingId(goal.id)}
                    className="w-full rounded-xl border border-sparrow-rule py-2 text-sm text-sparrow-gray hover:border-sparrow-green hover:text-sparrow-green active:bg-sparrow-mist"
                  >
                    Let my mentor know how this is going
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {met.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-sparrow-gray">
            Completed
          </p>
          <div className="space-y-2">
            {met.map((goal) => (
              <div key={goal.id} className="card flex items-center gap-3 opacity-70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sparrow-green text-xs font-bold text-white">
                  ✓
                </span>
                <div>
                  <p className="text-sm text-sparrow-gray line-through">{goal.title}</p>
                  <p className="text-xs text-sparrow-gray">{GOAL_AREA_LABEL[goal.area]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-sparrow-gray">
        Goals are set with your mentor during your one-on-one.
        <br />
        No sweat if a goal needs more time — just let them know.
      </p>
    </div>
  );
}
