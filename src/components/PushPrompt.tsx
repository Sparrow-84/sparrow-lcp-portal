import { useEffect, useState } from 'react';
import { getPushPermission, requestPushPermission } from '@/lib/push';
import { setFamilyPushEnabled } from '@/lib/lcp';

// One gentle, dismissible ask shown the first time a family is signed in and
// hasn't yet decided on push (browser permission still 'default'). Disappears
// permanently once they answer (granted or denied); "Not now" just hides it for
// this session so it isn't naggy but can still come back later.
export function PushPrompt({ onEnabled }: { onEnabled: () => void }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('sparrow.pushPromptDismissed') === '1';
    setVisible(!dismissed && getPushPermission() === 'default');
  }, []);

  if (!visible) return null;

  async function enable() {
    setBusy(true);
    try {
      const granted = await requestPushPermission();
      if (granted) {
        await setFamilyPushEnabled(true);
        onEnabled();
      }
    } finally {
      setBusy(false);
      setVisible(false);
    }
  }

  function dismiss() {
    sessionStorage.setItem('sparrow.pushPromptDismissed', '1');
    setVisible(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-sparrow-sage px-4 py-2.5 text-sm">
      <p className="text-sparrow-ink">Want a notification when you get a new message?</p>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={dismiss} className="text-xs font-medium text-sparrow-gray hover:text-sparrow-ink">
          Not now
        </button>
        <button
          onClick={() => void enable()}
          disabled={busy}
          className="rounded-lg bg-sparrow-green px-3 py-1.5 text-xs font-medium text-white hover:bg-sparrow-green-dark disabled:opacity-50"
        >
          {busy ? '…' : 'Yes, notify me'}
        </button>
      </div>
    </div>
  );
}
