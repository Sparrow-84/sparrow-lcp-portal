import { supabase } from '@/lib/supabase';
import type {
  CurrentSession,
  Family,
  Homework,
  HomeworkStatus,
  LcpEvent,
  Message,
  Redemption,
  Voucher,
} from '@/lib/types';

// Every query below is additionally constrained by Row-Level Security, so a family
// can only ever read/write its own rows even though some queries omit family_id.

export async function getMyFamily(): Promise<Family | null> {
  const { data } = await supabase
    .from('families')
    .select('id, display_name, login_email, status, current_session_number, housing_savings_cents')
    .maybeSingle();
  return (data as Family) ?? null;
}

export async function getCurrentSession(sessionNumber: number): Promise<CurrentSession | null> {
  const { data } = await supabase
    .from('lcp_sessions')
    .select('session_number, title, unit:lcp_units(name, phase:lcp_phases(number, name))')
    .eq('session_number', sessionNumber)
    .maybeSingle();
  return (data as CurrentSession | null) ?? null;
}

export async function getHomework(familyId: string): Promise<Homework[]> {
  const { data } = await supabase
    .from('lcp_homework')
    .select('*')
    .eq('family_id', familyId)
    .order('due_date', { ascending: true, nullsFirst: false });
  return (data as Homework[]) ?? [];
}

/** Participant action: mark complete / submit online, or reopen. */
export async function setHomeworkStatus(
  id: string,
  status: HomeworkStatus,
  submissionText?: string,
): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (status === 'submitted' || status === 'complete') {
    patch.submitted_at = new Date().toISOString();
    if (submissionText !== undefined) patch.submission_text = submissionText;
  }
  if (status === 'assigned') {
    patch.submitted_at = null;
  }
  await supabase.from('lcp_homework').update(patch).eq('id', id);
}

export async function getUpcomingEvents(limit = 6): Promise<LcpEvent[]> {
  const { data } = await supabase
    .from('lcp_events')
    .select('id, kind, title, starts_at, ends_at, location, mandatory, rsvp_enabled')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);
  return (data as LcpEvent[]) ?? [];
}

export async function getMessages(familyId: string): Promise<Message[]> {
  const { data } = await supabase
    .from('lcp_messages')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });
  return (data as Message[]) ?? [];
}

export async function sendMessage(familyId: string, body: string): Promise<void> {
  await supabase.from('lcp_messages').insert({ family_id: familyId, sender_kind: 'family', body });
}

export async function getVouchers(familyId: string): Promise<Voucher[]> {
  const { data } = await supabase
    .from('lcp_vouchers')
    .select('*')
    .eq('family_id', familyId)
    .order('earned_at', { ascending: false });
  return (data as Voucher[]) ?? [];
}

export async function getRedemptions(familyId: string): Promise<Redemption[]> {
  const { data } = await supabase
    .from('lcp_redemptions')
    .select('*')
    .eq('family_id', familyId)
    .order('requested_at', { ascending: false });
  return (data as Redemption[]) ?? [];
}

/** Participant requests a $25 gift card for 3 vouchers; Shelly fulfills it staff-side. */
export async function requestRedemption(familyId: string): Promise<void> {
  await supabase
    .from('lcp_redemptions')
    .insert({ family_id: familyId, vouchers_spent: 3, gift_card_value_cents: 2500, status: 'requested' });
}
