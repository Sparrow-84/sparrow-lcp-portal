import type { ComponentType } from 'react';
import { GoalsIcon, HomeIcon, JourneyIcon, MessagesIcon, PerksIcon } from './NavIcons';

// 'settings' is intentionally not in TABS below — it's reachable via a separate
// utility button (SideNav footer on desktop, header icon on mobile), not the main
// 5-tab bar, so the established primary nav doesn't change.
export type Tab = 'home' | 'goals' | 'messages' | 'rewards' | 'roadmap' | 'settings';

export const TABS: { key: Tab; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'goals', label: 'Goals', Icon: GoalsIcon },
  { key: 'messages', label: 'Messages', Icon: MessagesIcon },
  { key: 'roadmap', label: 'Journey', Icon: JourneyIcon },
  { key: 'rewards', label: 'Perks', Icon: PerksIcon },
];

export function BottomNav({
  tab,
  onChange,
  unread = 0,
  className = '',
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  unread?: number;
  className?: string;
}) {
  return (
    <nav
      className={`sticky bottom-0 z-10 flex border-t border-sparrow-rule bg-white pb-[env(safe-area-inset-bottom)] ${className}`}
    >
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
            <t.Icon className={`h-5 w-5 ${active ? '' : 'opacity-70'}`} />
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
