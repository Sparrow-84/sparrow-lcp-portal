import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import {
  getCurrentSession,
  getHomework,
  getMessages,
  getRedemptions,
  getUpcomingEvents,
  getVouchers,
} from '@/lib/lcp';
import type { CurrentSession, Homework, LcpEvent, Message, Redemption, Voucher } from '@/lib/types';
import { Wordmark } from '@/components/Wordmark';
import { MissionFooter } from '@/components/MissionFooter';
import { ProgressCard } from '@/components/ProgressCard';
import { ThisWeek } from '@/components/ThisWeek';
import { Upcoming } from '@/components/Upcoming';
import { MessagesView } from '@/components/MessagesView';
import { RewardsView } from '@/components/RewardsView';
import { BottomNav, type Tab } from '@/components/BottomNav';
import { SideNav } from '@/components/SideNav';

export function Dashboard() {
  const { family, signOut, refreshFamily } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState<CurrentSession | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [events, setEvents] = useState<LcpEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  const familyId = family?.id;
  const currentSessionNumber = family?.current_session_number ?? 1;

  const reload = useCallback(async () => {
    if (!familyId) return;
    const [sess, hw, ev, msg, vo, red] = await Promise.all([
      getCurrentSession(currentSessionNumber),
      getHomework(familyId),
      getUpcomingEvents(),
      getMessages(familyId),
      getVouchers(familyId),
      getRedemptions(familyId),
    ]);
    setSession(sess);
    setHomework(hw);
    setEvents(ev);
    setMessages(msg);
    setVouchers(vo);
    setRedemptions(red);
    setLoading(false);
  }, [familyId, currentSessionNumber]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!family) return null;
  const firstName = family.display_name.split(' ')[0];

  return (
    <div className="min-h-screen bg-sparrow-mist md:flex">
      <SideNav tab={tab} onChange={setTab} onSignOut={signOut} />

      <div className="mx-auto flex min-h-screen w-full max-w-phone flex-col md:mx-0 md:max-w-none md:flex-1">
        {/* Mobile header — on desktop the sidebar carries branding + sign out */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sparrow-rule bg-white px-4 py-3 md:hidden">
          <Wordmark />
          <button onClick={signOut} className="text-xs font-medium text-sparrow-gray hover:text-sparrow-ink">
            Sign out
          </button>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-sm text-sparrow-gray">Loading your dashboard…</p>
          ) : tab === 'home' ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto w-full max-w-3xl space-y-4">
                <div>
                  <h1 className="font-serif text-2xl font-semibold">Hi, {firstName} 👋</h1>
                  <p className="text-sm text-sparrow-gray">Here’s where things stand this week.</p>
                </div>
                <ProgressCard family={family} session={session} />
                <div className="grid gap-4 md:grid-cols-2">
                  <ThisWeek homework={homework} onChange={() => void reload()} />
                  <Upcoming events={events} />
                </div>
                <MissionFooter />
              </div>
            </div>
          ) : tab === 'messages' ? (
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden">
              <MessagesView familyId={family.id} messages={messages} onChange={() => void reload()} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto w-full max-w-3xl">
                <RewardsView
                  family={family}
                  vouchers={vouchers}
                  redemptions={redemptions}
                  onChange={() => {
                    void reload();
                    void refreshFamily();
                  }}
                />
                <MissionFooter />
              </div>
            </div>
          )}
        </main>

        <BottomNav tab={tab} onChange={setTab} className="md:hidden" />
      </div>
    </div>
  );
}
