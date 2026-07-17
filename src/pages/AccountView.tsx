import { useEffect, useState } from 'react';
import { getPushPermission, requestPushPermission } from '@/lib/push';
import { setFamilyPushEnabled } from '@/lib/lcp';
import type { Family } from '@/lib/types';

interface Props {
  family: Family;
  onChanged: () => void;
  onReplayTour: () => void;
  onSignOut: () => void;
}

export function AccountView({ family, onChanged, onReplayTour, onSignOut }: Props) {
  const [pushEnabled, setPushEnabled] = useState(family.push_enabled);
  const [pushBlocked, setPushBlocked] = useState(false);

  // Only re-sync when actually switching families, not on every incidental
  // refetch of the same family (e.g. a background session refresh) — otherwise
  // a toggle click that hasn't finished saving could get silently overwritten.
  useEffect(() => {
    setPushEnabled(family.push_enabled);
    setPushBlocked(getPushPermission() === 'denied');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family.id]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="font-serif text-2xl font-semibold">Account</h1>

        <section className="card flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sparrow-ink">Push notifications</p>
            <p className="mt-0.5 text-xs text-sparrow-gray">
              {pushBlocked
                ? 'Blocked in your browser — check your phone or browser notification settings to allow, then reload.'
                : 'Get notified about new messages, even when the app isn\'t open.'}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={pushEnabled && !pushBlocked}
            disabled={pushBlocked}
            onClick={async () => {
              const next = !pushEnabled;
              if (next && getPushPermission() !== 'granted') {
                const granted = await requestPushPermission();
                if (!granted) {
                  setPushBlocked(getPushPermission() === 'denied');
                  return;
                }
              }
              setPushEnabled(next);
              try {
                await setFamilyPushEnabled(next);
                onChanged();
              } catch {
                setPushEnabled(!next);
              }
            }}
            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
              pushEnabled && !pushBlocked ? 'bg-sparrow-green' : 'bg-sparrow-rule'
            } ${pushBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                pushEnabled && !pushBlocked ? 'left-[1.375rem]' : 'left-0.5'
              }`}
            />
          </button>
        </section>

        <section className="card">
          <button
            onClick={onReplayTour}
            className="text-sm font-medium text-sparrow-ink hover:text-sparrow-green"
          >
            Replay welcome tour
          </button>
        </section>

        <button
          onClick={onSignOut}
          className="w-full rounded-xl border border-sparrow-rule px-4 py-2.5 text-sm font-medium text-sparrow-gray transition hover:bg-sparrow-mist hover:text-sparrow-ink"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
