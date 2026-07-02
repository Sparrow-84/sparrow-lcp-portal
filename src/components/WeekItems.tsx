import { AREA_DOT, AREA_LABEL, RESOURCE_ICON, RESOURCE_LABEL, type WeekItem } from '@/lib/types';
import { defaultDueDate, dueLabel, isOverdue } from '@/lib/format';

function effectiveDueDate(item: WeekItem): string {
  const raw = item.kind === 'resource' ? item.data.due_date : item.data.due_date;
  if (raw) return raw;
  // Default: Sunday midnight of current week
  return defaultDueDate().toISOString().split('T')[0];
}

function ItemRow({
  item,
  onOpen,
}: {
  item: WeekItem;
  onOpen: (item: WeekItem) => void;
}) {
  const locked = item.kind === 'resource' ? item.data.locked : item.data.locked;
  const due = effectiveDueDate(item);
  const overdue = isOverdue(due) && !item.done;

  const title =
    item.kind === 'resource' ? item.data.title : item.data.title;
  const typeLabel =
    item.kind === 'resource'
      ? RESOURCE_LABEL[item.data.kind]
      : AREA_LABEL[item.data.area];
  const icon =
    item.kind === 'resource' ? RESOURCE_ICON[item.data.kind] : null;
  const areaColor =
    item.kind === 'homework' ? AREA_DOT[item.data.area] : null;

  return (
    <li>
      <button
        onClick={() => onOpen(item)}
        className="flex w-full items-start gap-3 rounded-xl border border-sparrow-rule/70 bg-white p-3 text-left active:bg-sparrow-mist"
      >
        {/* State circle */}
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
            item.done
              ? 'border-sparrow-green bg-sparrow-green text-white'
              : locked
              ? 'border-sparrow-rule bg-sparrow-rule/30 text-sparrow-gray'
              : 'border-sparrow-rule bg-white'
          }`}
        >
          {item.done ? '✓' : locked ? '🔒' : null}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${
              item.done
                ? 'text-sparrow-gray line-through'
                : 'text-sparrow-ink'
            }`}
          >
            {icon && <span className="mr-1">{icon}</span>}
            {title}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-sparrow-gray">
            {areaColor && (
              <span className={`inline-block h-2 w-2 rounded-full ${areaColor}`} />
            )}
            {typeLabel}
            {due && (
              <span className={overdue ? 'font-medium text-red-600' : ''}>
                · {dueLabel(due)}
              </span>
            )}
          </p>
        </div>

        <span className="mt-0.5 text-xs text-sparrow-gray">›</span>
      </button>
    </li>
  );
}

export function WeekItems({
  items,
  onOpen,
}: {
  items: WeekItem[];
  onOpen: (item: WeekItem, index: number) => void;
}) {
  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  const allDone = items.length > 0 && open.length === 0;

  return (
    <section className="card">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-lg font-semibold">This Week's Work</h2>
        <span className="text-xs text-sparrow-gray">
          {done.length}/{items.length} done
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-sparrow-gray">
          Nothing assigned yet. Check back soon. 🌿
        </p>
      ) : allDone ? (
        <div className="mt-3 rounded-xl bg-sparrow-sage p-4 text-center">
          <p className="font-serif text-base font-semibold text-sparrow-green">
            All done this week! 🎉
          </p>
          <p className="mt-1 text-sm text-sparrow-gray">Beautiful work. You earned it.</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {open.map((item, i) => (
            <ItemRow key={`${item.kind}-${item.data.id}`} item={item} onOpen={(it) => onOpen(it, i)} />
          ))}
        </ul>
      )}

      {done.length > 0 && !allDone && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-sparrow-gray">
            {done.length} completed
          </summary>
          <ul className="mt-2 space-y-2">
            {done.map((item, i) => (
              <ItemRow
                key={`${item.kind}-${item.data.id}`}
                item={item}
                onOpen={(it) => onOpen(it, open.length + i)}
              />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
