import { useState } from 'react';
import { AREA_DOT, AREA_LABEL, type Homework } from '@/lib/types';
import { setHomeworkStatus } from '@/lib/lcp';
import { dueLabel, isOverdue } from '@/lib/format';

function HomeworkRow({ hw, onChange }: { hw: Homework; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const done = hw.status === 'complete';

  async function toggle() {
    setBusy(true);
    await setHomeworkStatus(hw.id, done ? 'assigned' : 'complete');
    setBusy(false);
    onChange();
  }

  return (
    <li className="rounded-xl border border-sparrow-rule/70 bg-white">
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={toggle}
          disabled={busy}
          aria-pressed={done}
          aria-label={done ? 'Mark not done' : 'Mark done'}
          className={`task-circle mt-0.5 ${done ? 'task-circle-done animate-pop' : 'hover:border-sparrow-green'}`}
        >
          {done && (
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.29 6.8-6.8a1 1 0 011.4 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <button onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left">
          <p className={`text-sm font-medium ${done ? 'text-sparrow-gray line-through' : 'text-sparrow-ink'}`}>
            {hw.title}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-sparrow-gray">
            <span className={`inline-block h-2 w-2 rounded-full ${AREA_DOT[hw.area]}`} />
            {AREA_LABEL[hw.area]}
            {hw.due_date && (
              <span className={isOverdue(hw.due_date) && !done ? 'font-medium text-red-600' : ''}>
                · {dueLabel(hw.due_date)}
              </span>
            )}
          </p>
          {open && hw.description && <p className="mt-2 text-sm text-sparrow-ink/80">{hw.description}</p>}
        </button>
      </div>
    </li>
  );
}

export function ThisWeek({ homework, onChange }: { homework: Homework[]; onChange: () => void }) {
  const open = homework.filter((h) => h.status !== 'complete');
  const done = homework.filter((h) => h.status === 'complete');
  const allDone = homework.length > 0 && open.length === 0;

  return (
    <section className="card">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-lg font-semibold">This Week</h2>
        <span className="text-xs text-sparrow-gray">
          {done.length}/{homework.length} done
        </span>
      </div>

      {homework.length === 0 ? (
        <p className="mt-3 text-sm text-sparrow-gray">Nothing assigned right now. Enjoy the breather. 🌿</p>
      ) : allDone ? (
        <div className="mt-3 rounded-xl bg-sparrow-sage p-4 text-center">
          <p className="font-serif text-base font-semibold text-sparrow-green">All done this week! 🎉</p>
          <p className="mt-1 text-sm text-sparrow-gray">Beautiful work. You earned it.</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {open.map((hw) => (
            <HomeworkRow key={hw.id} hw={hw} onChange={onChange} />
          ))}
        </ul>
      )}

      {done.length > 0 && !allDone && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-sparrow-gray">
            {done.length} completed
          </summary>
          <ul className="mt-2 space-y-2">
            {done.map((hw) => (
              <HomeworkRow key={hw.id} hw={hw} onChange={onChange} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
