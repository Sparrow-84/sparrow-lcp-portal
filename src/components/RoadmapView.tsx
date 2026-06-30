import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getFinanceMilestones, getMilestoneProgress } from '@/lib/lcp';
import type { FinanceMilestone, FamilyMilestoneProgress, Resource } from '@/lib/types';
import { RESOURCE_ICON, RESOURCE_LABEL } from '@/lib/types';

interface RoadmapSession {
  session_number: number;
}
interface RoadmapUnit {
  id: number;
  name: string;
  sort_order: number;
  sessions: RoadmapSession[];
}
interface RoadmapPhase {
  id: number;
  number: number;
  name: string;
  sort_order: number;
  units: RoadmapUnit[];
}

type UnitState = 'complete' | 'current' | 'locked';

function unitState(unit: RoadmapUnit, currentSession: number): UnitState {
  const nums = unit.sessions.map((s) => s.session_number);
  if (!nums.length) return 'locked';
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  if (max < currentSession) return 'complete';
  if (min <= currentSession) return 'current';
  return 'locked';
}

function StateCircle({ state }: { state: UnitState }) {
  if (state === 'complete')
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sparrow-green text-xs font-bold text-white">
        ✓
      </span>
    );
  if (state === 'current')
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-sparrow-green bg-white text-[10px] font-bold text-sparrow-green">
        ●
      </span>
    );
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-sparrow-rule bg-sparrow-mist text-[10px] text-sparrow-gray">
      🔒
    </span>
  );
}

async function fetchRoadmap(): Promise<RoadmapPhase[]> {
  const { data } = await supabase
    .from('lcp_phases')
    .select(
      'id, number, name, sort_order, units:lcp_units(id, name, sort_order, sessions:lcp_sessions(session_number))',
    )
    .order('sort_order');
  return (data as RoadmapPhase[]) ?? [];
}

async function fetchUnitResources(unitId: number): Promise<Resource[]> {
  // Get all sessions for this unit, then fetch participant resources for those sessions.
  const { data: sessions } = await supabase
    .from('lcp_sessions')
    .select('id')
    .eq('unit_id', unitId);
  if (!sessions?.length) return [];
  const sessionIds = sessions.map((s: { id: number }) => s.id);

  const { data } = await supabase
    .from('lcp_resources')
    .select('id, session_id, kind, audience, title, drive_url, created_at')
    .in('session_id', sessionIds)
    .eq('audience', 'participant')
    .order('sort_order', { ascending: true });

  return ((data ?? []) as Omit<Resource, 'content' | 'response_prompt' | 'due_date' | 'locked' | 'sort_order'>[]).map(
    (r) => ({ ...r, content: null, response_prompt: null, due_date: null, locked: false, sort_order: 0 }),
  ) as Resource[];
}

function UnitResources({ unitId }: { unitId: number }) {
  const [resources, setResources] = useState<Resource[] | null>(null);

  useEffect(() => {
    fetchUnitResources(unitId).then(setResources);
  }, [unitId]);

  if (resources === null)
    return <p className="mt-2 text-xs text-sparrow-gray">Loading…</p>;
  if (!resources.length)
    return <p className="mt-2 text-xs text-sparrow-gray italic">No resources for this unit yet.</p>;

  return (
    <ul className="mt-2 space-y-1">
      {resources.map((r) => (
        <li key={r.id} className="flex items-center gap-2 text-xs text-sparrow-gray">
          <span>{RESOURCE_ICON[r.kind]}</span>
          {r.drive_url ? (
            <a
              href={r.drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sparrow-green underline underline-offset-2"
            >
              {r.title}
            </a>
          ) : (
            <span>{r.title}</span>
          )}
          <span className="text-sparrow-rule">·</span>
          <span>{RESOURCE_LABEL[r.kind]}</span>
        </li>
      ))}
    </ul>
  );
}

export function RoadmapView({
  currentSession,
  familyId,
}: {
  currentSession: number;
  familyId: string;
}) {
  const [phases, setPhases] = useState<RoadmapPhase[] | null>(null);
  const [openUnit, setOpenUnit] = useState<number | null>(null);
  const [milestones, setMilestones] = useState<FinanceMilestone[]>([]);
  const [milestoneProgress, setMilestoneProgress] = useState<FamilyMilestoneProgress[]>([]);

  useEffect(() => {
    fetchRoadmap().then(setPhases);
  }, []);

  useEffect(() => {
    if (!familyId) return;
    Promise.all([getFinanceMilestones(), getMilestoneProgress(familyId)]).then(
      ([ms, mp]) => { setMilestones(ms); setMilestoneProgress(mp); },
    );
  }, [familyId]);

  if (phases === null)
    return <p className="p-8 text-center text-sm text-sparrow-gray">Loading your journey…</p>;

  const completedMilestoneIds = new Set(milestoneProgress.map((p) => p.milestone_id));
  const milestonesCompleted = completedMilestoneIds.size;
  const nextMilestone = milestones.find((m) => !completedMilestoneIds.has(m.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">My Journey</h1>
        <p className="mt-1 text-sm text-sparrow-gray">
          See where you've been and where you're going.
        </p>
      </div>

      {milestones.length > 0 && (
        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-sparrow-gold">
                Financial pathway
              </p>
              <h2 className="mt-0.5 font-serif text-lg font-semibold text-sparrow-green">
                Building Your Foundation
              </h2>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl font-semibold text-sparrow-green">
                {milestonesCompleted}
              </p>
              <p className="text-xs text-sparrow-gray">of {milestones.length}</p>
            </div>
          </div>

          <ul className="space-y-2">
            {milestones.map((m) => {
              const done = completedMilestoneIds.has(m.id);
              const isNext = m.id === nextMilestone?.id;
              return (
                <li
                  key={m.id}
                  className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${
                    done
                      ? 'bg-sparrow-green/5'
                      : isNext
                      ? 'bg-sparrow-gold/5'
                      : 'opacity-50'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? 'bg-sparrow-green text-white'
                        : isNext
                        ? 'border-2 border-sparrow-gold text-sparrow-gold'
                        : 'border-2 border-sparrow-rule text-sparrow-rule'
                    }`}
                  >
                    {done ? '✓' : m.sort_order}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        done ? 'text-sparrow-gray line-through' : 'text-sparrow-ink'
                      }`}
                    >
                      {m.title}
                    </p>
                    {!done && isNext && (
                      <p className="mt-0.5 text-xs text-sparrow-gray">{m.description}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-sparrow-gray">
            Your mentor checks these off with you during your one-on-one.
          </p>
        </section>
      )}

      {phases.map((phase) => (
        <section key={phase.id} className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-sparrow-gold">
            Phase {phase.number}
          </p>
          <h2 className="mt-0.5 font-serif text-lg font-semibold text-sparrow-green">
            {phase.name}
          </h2>

          <ul className="mt-3 space-y-2">
            {[...phase.units]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((unit) => {
                const state = unitState(unit, currentSession);
                const canOpen = state !== 'locked';
                const isOpen = openUnit === unit.id;

                return (
                  <li key={unit.id}>
                    <button
                      disabled={!canOpen}
                      onClick={() => setOpenUnit(isOpen ? null : unit.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        canOpen
                          ? 'hover:bg-sparrow-mist active:bg-sparrow-sage'
                          : 'cursor-default opacity-60'
                      } ${isOpen ? 'bg-sparrow-mist' : ''}`}
                    >
                      <StateCircle state={state} />
                      <span
                        className={`flex-1 text-sm font-medium ${
                          state === 'locked' ? 'text-sparrow-gray' : 'text-sparrow-ink'
                        }`}
                      >
                        {unit.name}
                      </span>
                      {canOpen && (
                        <span className="text-xs text-sparrow-gray">{isOpen ? '▲' : '▼'}</span>
                      )}
                    </button>

                    {isOpen && canOpen && (
                      <div className="px-3 pb-3">
                        <UnitResources unitId={unit.id} />
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
