import { Wordmark } from './Wordmark';
import { TABS, type Tab } from './BottomNav';

/** Desktop-only left nav (md+). Mobile uses BottomNav instead. */
export function SideNav({
  tab,
  onChange,
  onSignOut,
  onReopenTour,
  unread = 0,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  onSignOut: () => void;
  onReopenTour?: () => void;
  unread?: number;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sparrow-rule bg-white px-4 py-5 md:flex">
      <div className="px-2">
        <Wordmark />
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                active
                  ? 'bg-sparrow-sage text-sparrow-green'
                  : 'text-sparrow-gray hover:bg-sparrow-mist hover:text-sparrow-ink'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span className="flex-1">{t.label}</span>
              {t.key === 'messages' && unread > 0 && (
                <span className="rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">{unread}</span>
              )}
            </button>
          );
        })}
      </nav>

      {onReopenTour && (
        <button
          onClick={onReopenTour}
          className="rounded-lg px-3 py-2 text-left text-sm font-medium text-sparrow-gray hover:bg-sparrow-mist hover:text-sparrow-ink"
        >
          ? Tour
        </button>
      )}
      <button
        onClick={onSignOut}
        className="mt-1 rounded-lg px-3 py-2 text-left text-sm font-medium text-sparrow-gray hover:bg-sparrow-mist hover:text-sparrow-ink"
      >
        Sign out
      </button>
    </aside>
  );
}
