import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import {
  getCurrentSession,
  getGoalResponses,
  getGoals,
  getHomework,
  getMessages,
  getRedemptions,
  getResourceCompletions,
  getSessionResources,
  getThisWeekEvents,
  getVouchers,
} from '@/lib/lcp';
import type {
  CurrentSession,
  Goal,
  GoalResponse,
  Homework,
  LcpEvent,
  Message,
  Redemption,
  Resource,
  ResourceCompletion,
  Voucher,
  WeekItem,
} from '@/lib/types';
import { Wordmark } from '@/components/Wordmark';
import { MissionFooter } from '@/components/MissionFooter';
import { WeekItems } from '@/components/WeekItems';
import { MeetingsSection } from '@/components/MeetingsSection';
import { MessagesView } from '@/components/MessagesView';
import { RewardsView } from '@/components/RewardsView';
import { EventDetail, buildCantMakeitDraft } from '@/components/EventDetail';
import { ItemDetail } from '@/components/ItemDetail';
import { RoadmapView } from '@/components/RoadmapView';
import { GoalsView } from '@/components/GoalsView';
import { BottomNav, type Tab } from '@/components/BottomNav';
import { SideNav } from '@/components/SideNav';
import { GuidedTour, useGuidedTour } from '@/components/GuidedTour';

type DetailView =
  | { type: 'event'; event: LcpEvent }
  | { type: 'item'; index: number };

export function Dashboard() {
  const { family, signOut, refreshFamily } = useAuth();
  const { tourOpen, dismissTour, reopenTour } = useGuidedTour();
  const [tab, setTab] = useState<Tab>('home');
  const [detail, setDetail] = useState<DetailView | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState<CurrentSession | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [completions, setCompletions] = useState<ResourceCompletion[]>([]);
  const [events, setEvents] = useState<LcpEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalResponses, setGoalResponses] = useState<GoalResponse[]>([]);

  const familyId = family?.id;
  const currentSessionNumber = family?.current_session_number ?? 1;

  const reload = useCallback(async () => {
    if (!familyId) return;
    const [sess, hw, res, comps, ev, msg, vo, red, gl, gr] = await Promise.all([
      getCurrentSession(currentSessionNumber),
      getHomework(familyId),
      getSessionResources(currentSessionNumber),
      getResourceCompletions(familyId),
      getThisWeekEvents(),
      getMessages(familyId),
      getVouchers(familyId),
      getRedemptions(familyId),
      getGoals(familyId),
      getGoalResponses(familyId),
    ]);
    setSession(sess);
    setHomework(hw);
    setResources(res);
    setCompletions(comps);
    setEvents(ev);
    setMessages(msg);
    setVouchers(vo);
    setRedemptions(red);
    setGoals(gl);
    setGoalResponses(gr);
    setLoading(false);
  }, [familyId, currentSessionNumber]);

  useEffect(() => { void reload(); }, [reload]);

  // Build the sorted, unified weekly items list.
  const weekItems = useMemo((): WeekItem[] => {
    const completedIds = new Set(completions.map((c) => c.resource_id));
    const resItems: WeekItem[] = resources.map((r) => ({
      kind: 'resource',
      data: r,
      done: completedIds.has(r.id),
    }));
    const hwItems: WeekItem[] = homework.map((h) => ({
      kind: 'homework',
      data: h,
      done: h.status === 'complete',
    }));
    // Merge and sort by sort_order; use a large offset for homework so
    // resources lead by default until staff set explicit ordering.
    return [...resItems, ...hwItems].sort(
      (a, b) =>
        (a.kind === 'resource' ? a.data.sort_order : a.data.sort_order + 1000) -
        (b.kind === 'resource' ? b.data.sort_order : b.data.sort_order + 1000),
    );
  }, [resources, homework, completions]);

  // Unread message count for badge.
  const unread = messages.filter(
    (m) => m.sender_kind === 'staff' && !m.read_at,
  ).length;

  if (!family) return null;
  const firstName = family.display_name.split(' ')[0];
  const unitName = session?.unit?.name ?? null;
  const unitNumber = session?.unit?.phase?.number ?? null;

  function openMessages(draft = '') {
    setMessageDraft(draft);
    setDetail(null);
    setTab('messages');
  }

  // ── Detail overlay ────────────────────────────────────────────────────
  if (detail?.type === 'event') {
    return (
      <div className="min-h-screen bg-white md:flex">
        <SideNav tab={tab} onChange={setTab} onSignOut={signOut} unread={unread} />
        <div className="mx-auto w-full max-w-phone md:max-w-2xl">
          <EventDetail
            event={detail.event}
            onBack={() => setDetail(null)}
            onOpenMessages={openMessages}
            prefillDraft={buildCantMakeitDraft}
          />
        </div>
      </div>
    );
  }

  if (detail?.type === 'item') {
    const item = weekItems[detail.index];
    if (item) {
      return (
        <div className="min-h-screen bg-white md:flex">
          <SideNav tab={tab} onChange={setTab} onSignOut={signOut} unread={unread} />
          <div className="mx-auto flex w-full max-w-phone flex-col md:max-w-2xl">
            <ItemDetail
              item={item}
              familyId={familyId!}
              items={weekItems}
              currentIndex={detail.index}
              onBack={() => setDetail(null)}
              onDone={() => { void reload(); setDetail(null); }}
              onNavigate={(i) => setDetail({ type: 'item', index: i })}
            />
          </div>
        </div>
      );
    }
  }

  // ── Main tabs ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-sparrow-mist md:flex">
      {tourOpen && <GuidedTour onDismiss={dismissTour} />}

      <SideNav tab={tab} onChange={setTab} onSignOut={signOut} unread={unread} />

      <div className="mx-auto flex min-h-screen w-full max-w-phone flex-col md:mx-0 md:max-w-none md:flex-1">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sparrow-rule bg-white px-4 py-3 md:hidden">
          <Wordmark />
          <div className="flex items-center gap-3">
            <button
              onClick={reopenTour}
              className="text-xs font-medium text-sparrow-gray hover:text-sparrow-ink"
              aria-label="Show tour"
            >
              ?
            </button>
            <button onClick={signOut} className="text-xs font-medium text-sparrow-gray hover:text-sparrow-ink">
              Sign out
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-sm text-sparrow-gray">Loading your dashboard…</p>
          ) : tab === 'home' ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto w-full max-w-3xl space-y-4">
                {/* Greeting */}
                <div>
                  <h1 className="font-serif text-2xl font-semibold">Hi, {firstName} 👋</h1>
                  {unitName && (
                    <p className="mt-0.5 text-sm text-sparrow-gray">
                      {unitNumber != null ? `Unit ${unitNumber} · ` : ''}
                      {unitName}
                    </p>
                  )}
                </div>

                {/* Pre-session encouragement card */}
                {session?.unit?.encouragement_text && (
                  <div className="rounded-xl border border-sparrow-green/30 bg-sparrow-green/5 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-sparrow-green">
                      A note before group
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-sparrow-ink">
                      {session.unit.encouragement_text}
                    </p>
                  </div>
                )}

                {/* This week's items */}
                <WeekItems
                  items={weekItems}
                  onOpen={(_, index) => setDetail({ type: 'item', index })}
                />

                {/* This week's meetings */}
                <MeetingsSection
                  events={events}
                  onEventTap={(ev) => setDetail({ type: 'event', event: ev })}
                />

                <MissionFooter />
              </div>
            </div>
          ) : tab === 'messages' ? (
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden">
              <MessagesView
                familyId={family.id}
                messages={messages}
                initialDraft={messageDraft}
                onChange={() => { void reload(); setMessageDraft(''); }}
              />
            </div>
          ) : tab === 'rewards' ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto w-full max-w-3xl">
                <RewardsView
                  family={family}
                  vouchers={vouchers}
                  redemptions={redemptions}
                  onChange={() => { void reload(); void refreshFamily(); }}
                />
                <MissionFooter />
              </div>
            </div>
          ) : tab === 'goals' ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto w-full max-w-3xl">
                <GoalsView
                  familyId={family.id}
                  goals={goals}
                  goalResponses={goalResponses}
                  onChanged={() => void reload()}
                />
                <MissionFooter />
              </div>
            </div>
          ) : tab === 'roadmap' ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto w-full max-w-3xl">
                <RoadmapView currentSession={currentSessionNumber} familyId={family.id} />
                <MissionFooter />
              </div>
            </div>
          ) : null}
        </main>

        <BottomNav tab={tab} onChange={(t) => { setDetail(null); setTab(t); }} unread={unread} className="md:hidden" />
      </div>
    </div>
  );
}
