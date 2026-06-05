export type Tab = 'home' | 'messages' | 'rewards';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'messages', label: 'Messages', icon: '💬' },
  { key: 'rewards', label: 'Rewards', icon: '🎁' },
];

export function BottomNav({
  tab,
  onChange,
  unread = 0,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  unread?: number;
}) {
  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-sparrow-rule bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => {
        const active = t.key === tab;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
              active ? 'text-sparrow-green' : 'text-sparrow-gray'
            }`}
          >
            <span className={`text-lg ${active ? '' : 'opacity-70'}`}>{t.icon}</span>
            {t.label}
            {t.key === 'messages' && unread > 0 && (
              <span className="absolute right-1/2 top-1.5 translate-x-4 rounded-full bg-red-600 px-1.5 text-[9px] font-semibold text-white">
                {unread}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
