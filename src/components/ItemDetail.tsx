import { useState } from 'react';
import {
  AREA_LABEL,
  RESOURCE_ICON,
  RESOURCE_LABEL,
  type WeekItem,
} from '@/lib/types';
import { completeResource, setHomeworkStatus } from '@/lib/lcp';

function typeInfo(item: WeekItem): { icon: string; label: string } {
  if (item.kind === 'resource') {
    return { icon: RESOURCE_ICON[item.data.kind], label: RESOURCE_LABEL[item.data.kind] };
  }
  return { icon: '✏️', label: AREA_LABEL[item.data.area] };
}

export function ItemDetail({
  item,
  familyId,
  items,
  currentIndex,
  onBack,
  onDone,
  onNavigate,
}: {
  item: WeekItem;
  familyId: string;
  items: WeekItem[];
  currentIndex: number;
  onBack: () => void;
  onDone: () => void;
  onNavigate: (index: number) => void;
}) {
  const [response, setResponse] = useState(
    item.kind === 'homework' ? (item.data.submission_text ?? '') : '',
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const locked = item.kind === 'resource' ? item.data.locked : item.data.locked;
  const { icon, label } = typeInfo(item);
  const title = item.data.title;
  const content = item.kind === 'resource' ? item.data.content : item.data.description;
  const responsePrompt =
    item.kind === 'resource' ? item.data.response_prompt : null;
  const hasNext = currentIndex < items.length - 1;
  const nextItem = hasNext ? items[currentIndex + 1] : null;

  async function markDone() {
    setSaving(true);
    if (item.kind === 'resource') {
      await completeResource(item.data.id, familyId, response || undefined);
    } else {
      await setHomeworkStatus(item.data.id, 'complete', response || undefined);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onDone();
    }, 800);
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sparrow-rule px-4 py-3">
        <button onClick={onBack} className="text-sm font-medium text-sparrow-green">
          ← Back
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-sparrow-gold">
          {icon} {label}
        </p>
        <h1 className="mt-1 font-serif text-xl font-semibold text-sparrow-ink">{title}</h1>

        <div className="mt-4 border-t border-sparrow-rule/50 pt-4">
          {locked ? (
            /* Locked state */
            <div className="py-8 text-center">
              <p className="text-3xl">🔒</p>
              <p className="mt-3 font-serif text-base font-semibold text-sparrow-ink">
                Not quite yet.
              </p>
              <p className="mt-1 text-sm text-sparrow-gray">
                Your LifeChange team will open this up for you when it's ready.
              </p>
            </div>
          ) : (
            <>
              {/* Content */}
              {content ? (
                <div className="prose prose-sm max-w-none text-sparrow-ink">
                  {content.split('\n').map((para, i) =>
                    para.trim() ? (
                      <p key={i} className="mb-3 text-sm leading-relaxed">
                        {para}
                      </p>
                    ) : null,
                  )}
                </div>
              ) : item.kind === 'resource' && item.data.drive_url ? (
                <a
                  href={item.data.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  Open resource ↗
                </a>
              ) : (
                <p className="text-sm text-sparrow-gray italic">Content coming soon.</p>
              )}

              {/* Response area */}
              {(responsePrompt || item.kind === 'homework') && !item.done && (
                <div className="mt-6">
                  <div className="border-t border-sparrow-rule/50 pt-4">
                    {responsePrompt && (
                      <p className="mb-2 text-sm font-medium text-sparrow-ink">
                        {responsePrompt}
                      </p>
                    )}
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Your response…"
                      rows={4}
                      className="field-input w-full resize-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer actions */}
      {!locked && (
        <div className="border-t border-sparrow-rule bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            {!item.done && (
              <button
                onClick={markDone}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saved ? 'Done! ✓' : saving ? 'Saving…' : 'Mark as Done ✓'}
              </button>
            )}
            {item.done && (
              <p className="flex-1 text-center text-sm font-medium text-sparrow-green">
                ✓ Completed
              </p>
            )}
            {hasNext && (
              <button
                onClick={() => onNavigate(currentIndex + 1)}
                className={`text-sm font-medium ${
                  nextItem && (nextItem.kind === 'resource' ? nextItem.data.locked : nextItem.data.locked)
                    ? 'text-sparrow-gray'
                    : 'text-sparrow-green'
                }`}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {locked && hasNext && (
        <div className="border-t border-sparrow-rule bg-white px-4 py-3 text-right">
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="text-sm font-medium text-sparrow-gray"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
