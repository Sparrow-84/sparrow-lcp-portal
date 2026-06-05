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

export interface Family {
  id: string;
  display_name: string;
  login_email: string;
  status: FamilyStatus;
  current_session_number: number;
  housing_savings_cents: number;
}

export interface CurrentSession {
  session_number: number;
  title: string;
  unit: { name: string; phase: { number: number; name: string } | null } | null;
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

export const AREA_LABEL: Record<HomeworkArea, string> = {
  relational: 'Relational',
  physical_financial: 'Physical & Financial',
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
