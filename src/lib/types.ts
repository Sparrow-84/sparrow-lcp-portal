// Shared LCP types (kept in sync with the schema in
// sparrow-staff-portal/supabase/migrations/0005_lcp.sql).

export const TOTAL_SESSIONS = 48;
export const VOUCHERS_PER_REDEMPTION = 3;
export const REDEMPTION_VALUE_CENTS = 2500;

export type FamilyStatus = 'onboarding' | 'on_track' | 'needs_attention' | 'graduated';
export type EventKind = 'curriculum' | 'dinner' | 'one_on_one' | 'volunteer' | 'other';
export type AttendanceStatus = 'on_time' | 'late' | 'no_show';
export type HomeworkArea = 'relational' | 'physical_financial' | 'spiritual' | 'emotional' | 'general';
export type HomeworkStatus = 'assigned' | 'submitted' | 'complete';
export type MessageSender = 'staff' | 'family';
export type ResourceKind = 'handout' | 'teacher_guide' | 'devotional' | 'ppt' | 'art' | 'other';

export interface Family {
  id: string;
  display_name: string;
  login_email: string;
  status: FamilyStatus;
  current_session_number: number;
  housing_savings_cents: number;
  push_enabled: boolean;
}

export interface CurrentSession {
  session_number: number;
  title: string;
  unit: { name: string; encouragement_text: string | null; phase: { number: number; name: string } | null } | null;
}

export interface Homework {
  id: string;
  family_id: string;
  session_id: number | null;
  area: HomeworkArea;
  title: string;
  description: string | null;
  due_date: string | null;
  status: HomeworkStatus;
  submission_text: string | null;
  submitted_at: string | null;
  // Added by migration 0040 — null-safe until Byron runs it
  locked: boolean;
  sort_order: number;
}

export interface Resource {
  id: string;
  session_id: number | null;
  kind: ResourceKind;
  audience: 'participant' | 'staff';
  title: string;
  drive_url: string | null;
  created_at: string;
  // Added by migration 0040 — null until Byron runs it
  content: string | null;
  response_prompt: string | null;
  due_date: string | null;
  locked: boolean;
  sort_order: number;
}

export interface ResourceCompletion {
  id: string;
  family_id: string;
  resource_id: string;
  response_text: string | null;
  completed_at: string;
}

// Unified weekly item — either a resource or homework entry.
// Used by the items list and item detail view.
export type WeekItem =
  | { kind: 'resource'; data: Resource; done: boolean }
  | { kind: 'homework'; data: Homework; done: boolean };

export function weekItemSortKey(item: WeekItem): number {
  return item.kind === 'resource' ? item.data.sort_order : item.data.sort_order;
}

export function weekItemDueDate(item: WeekItem): string | null {
  return item.kind === 'resource' ? item.data.due_date : item.data.due_date;
}

export function weekItemLocked(item: WeekItem): boolean {
  return item.kind === 'resource' ? item.data.locked : item.data.locked;
}

export interface LcpEvent {
  id: string;
  kind: EventKind;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  mandatory: boolean;
  rsvp_enabled: boolean;
}

export interface Message {
  id: string;
  family_id: string;
  sender_kind: MessageSender;
  sender_id: string | null;
  body: string;
  created_at: string;
  read_at: string | null;
  // Added by migration 0053 — null-safe until Byron runs it
  voice_url: string | null;
  voice_duration: number | null;
  image_url: string | null;
  // Added by migration 0054 — null-safe until Byron runs it
  reply_to_id: string | null;
  edited_at: string | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

export interface Voucher {
  id: string;
  family_id: string;
  kind: 'gift_card' | 'housing';
  earned_for: string | null;
  earned_at: string;
  redemption_id: string | null;
}

export interface Redemption {
  id: string;
  family_id: string;
  vouchers_spent: number;
  gift_card_value_cents: number;
  status: 'requested' | 'fulfilled' | 'cancelled';
  requested_at: string;
  fulfilled_at: string | null;
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export type GoalArea = 'spiritual' | 'physical_financial' | 'emotional' | 'relational' | 'general';
export type GoalStatus = 'active' | 'met';
export type GoalResponseKind = 'met' | 'needs_time';

export interface Goal {
  id: string;
  family_id: string;
  area: GoalArea;
  title: string;
  due_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  met_at: string | null;
}

export interface GoalResponse {
  id: string;
  goal_id: string;
  family_id: string;
  response: GoalResponseKind;
  note: string | null;
  created_at: string;
}

export const GOAL_AREA_LABEL: Record<GoalArea, string> = {
  spiritual:          'Spiritual',
  physical_financial: 'Physical',
  emotional:          'Emotional',
  relational:         'Relational',
  general:            'General',
};

// ── Finance milestones ────────────────────────────────────────────────────────

export interface FinanceMilestone {
  id: number;
  sort_order: number;
  title: string;
  description: string;
}

export interface FamilyMilestoneProgress {
  id: string;
  family_id: string;
  milestone_id: number;
  completed_at: string;
}

export const AREA_LABEL: Record<HomeworkArea, string> = {
  relational: 'Relational',
  physical_financial: 'Physical',
  spiritual: 'Spiritual',
  emotional: 'Emotional',
  general: 'General',
};

export const AREA_DOT: Record<HomeworkArea, string> = {
  relational: 'bg-area-relational',
  physical_financial: 'bg-area-physical_financial',
  spiritual: 'bg-area-spiritual',
  emotional: 'bg-area-emotional',
  general: 'bg-area-general',
};

export const EVENT_LABEL: Record<EventKind, string> = {
  curriculum: 'Group session',
  dinner: 'Dinner',
  one_on_one: 'One-on-one',
  volunteer: 'Volunteer',
  other: 'Event',
};

export const RESOURCE_LABEL: Record<ResourceKind, string> = {
  handout: 'Handout',
  teacher_guide: 'Guide',
  devotional: 'Devotional',
  ppt: 'Slides',
  art: 'Activity',
  other: 'Resource',
};

export const RESOURCE_ICON: Record<ResourceKind, string> = {
  handout: '📋',
  teacher_guide: '📖',
  devotional: '✦',
  ppt: '📊',
  art: '🎨',
  other: '📄',
};
