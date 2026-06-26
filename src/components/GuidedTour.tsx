import { useState } from 'react';

const STEPS = [
  {
    icon: '👋',
    title: 'Welcome to your portal',
    body: "This is your LifeChange home base. Everything you need for the week — readings, worksheets, meetings, and more — is right here. Let's take a quick look around.",
    tag: null,
  },
  {
    icon: '📋',
    title: 'Your week',
    body: "The home screen shows everything on your plate for the week. Tap any item to open it, read through it, and mark it done. Meetings show up here too.",
    tag: { icon: '🏠', label: 'Home' },
  },
  {
    icon: '💬',
    title: 'Your LifeChange team',
    body: "Need to ask something? Can't make a session? Send your team a message right here and they'll get back to you. You're never on your own.",
    tag: { icon: '💬', label: 'Messages' },
  },
  {
    icon: '🎁',
    title: 'Rewards',
    body: "Every time you show up, you earn points. They add up to gift cards — a small thank-you for the hard work you're putting in.",
    tag: { icon: '🎁', label: 'Rewards' },
  },
  {
    icon: '🗺️',
    title: 'Your journey',
    body: "See where you've been and where you're headed. Each unit in the program unlocks as you go. Tap any completed unit to revisit it.",
    tag: { icon: '🗺️', label: 'My Journey' },
  },
  {
    icon: '✨',
    title: "You're all set",
    body: "That's it — your portal is ready. Your team is in your corner. Take it one week at a time, and know that every step forward matters.",
    tag: null,
  },
];

const STORAGE_KEY = 'lcp-tour-seen';

export function useGuidedTour() {
  const seen = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'done';
  const [open, setOpen] = useState(!seen);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'done');
    setOpen(false);
  }

  function reopen() {
    setOpen(true);
  }

  return { tourOpen: open, dismissTour: dismiss, reopenTour: reopen };
}

export function GuidedTour({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  function finish() {
    localStorage.setItem(STORAGE_KEY, 'done');
    onDismiss();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sparrow-ink/60 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) finish(); }}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white px-6 pb-6 pt-5 shadow-xl">
        {/* Skip */}
        <button
          onClick={finish}
          className="absolute right-4 top-4 text-xs text-sparrow-gray hover:text-sparrow-ink"
        >
          Skip tour
        </button>

        {/* Icon */}
        <div className="mb-3 text-4xl">{current.icon}</div>

        {/* Title */}
        <h2 className="font-serif text-xl font-semibold text-sparrow-green">
          {current.title}
        </h2>

        {/* Body */}
        <p className="mt-2 text-sm leading-relaxed text-sparrow-gray">{current.body}</p>

        {/* Section tag */}
        {current.tag && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sparrow-sage px-3 py-1 text-xs font-medium text-sparrow-green">
            <span>{current.tag.icon}</span>
            <span>{current.tag.label}</span>
          </div>
        )}

        {/* Dot indicators */}
        <div className="mt-5 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? 'w-5 bg-sparrow-green'
                  : 'w-1.5 bg-sparrow-rule hover:bg-sparrow-gray'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-4 flex gap-2">
          {!isFirst && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="btn-ghost flex-1"
            >
              Back
            </button>
          )}
          {isLast ? (
            <button onClick={finish} className="btn-primary flex-1">
              Get started
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary flex-1"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
