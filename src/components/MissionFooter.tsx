// A quiet, ambient line of Sparrow's mission / values / verse. Rotates daily so it
// doesn't go stale (per the brief — not a banner, not a popup, just a presence).
// A per-user "hide" toggle belongs in Settings (Phase 2); kept simple here.

const LINES = [
  '“Even the sparrow finds a home, and the swallow a nest for herself.” — Psalm 84:3',
  'We see people — not problems to be managed.',
  'Hope is found here.',
  'We rebuild family, one room at a time.',
  'We make room for the next person walking in.',
  'We learn as we give, and give as we learn.',
];

function lineForToday(): string {
  // Day-of-year index keeps it stable for a whole day, then rotates.
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return LINES[dayOfYear % LINES.length];
}

export function MissionFooter() {
  return (
    <p className="px-4 py-3 text-center text-xs italic text-sparrow-gray">{lineForToday()}</p>
  );
}
