import { useState, type FormEvent } from 'react';
import type { Message } from '@/lib/types';
import { sendMessage } from '@/lib/lcp';
import { timeLabel, dayLabel } from '@/lib/format';

export function MessagesView({
  familyId,
  messages,
  onChange,
}: {
  familyId: string;
  messages: Message[];
  onChange: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    await sendMessage(familyId, body);
    setDraft('');
    setBusy(false);
    onChange();
  }

  return (
    <section className="flex h-full flex-col">
      <div className="border-b border-sparrow-rule px-4 py-3">
        <h2 className="font-serif text-lg font-semibold">Messages from LCP Staff</h2>
        <p className="text-xs text-sparrow-gray">Shelly and the LifeChange team are on the other side.</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-sparrow-gray">No messages yet. Say hello! 👋</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_kind === 'family';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? 'rounded-br-sm bg-sparrow-green text-white'
                      : 'rounded-bl-sm bg-white text-sparrow-ink shadow-card'
                  }`}
                >
                  <p>{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-sparrow-gray'}`}>
                    {dayLabel(m.created_at)} · {timeLabel(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="flex items-end gap-2 border-t border-sparrow-rule bg-white p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          rows={1}
          className="field-input mt-0 max-h-32 flex-1 resize-none"
        />
        <button type="submit" disabled={busy || !draft.trim()} className="btn-primary">
          Send
        </button>
      </form>
    </section>
  );
}
