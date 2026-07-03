import { supabase } from '@/lib/supabase';
import type {
  CurrentSession,
  Family,
  FamilyMilestoneProgress,
  FinanceMilestone,
  Goal,
  GoalResponse,
  Homework,
  HomeworkStatus,
  LcpEvent,
  Message,
  MessageReaction,
  Redemption,
  Resource,
  ResourceCompletion,
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
    .select('session_number, title, unit:lcp_units(name, encouragement_text, phase:lcp_phases(number, name))')
    .eq('session_number', sessionNumber)
    .maybeSingle();
  return (data as CurrentSession | null) ?? null;
}

export async function getHomework(familyId: string): Promise<Homework[]> {
  const { data } = await supabase
    .from('lcp_homework')
    .select('id, family_id, session_id, area, title, description, due_date, status, submission_text, submitted_at, locked, sort_order')
    .eq('family_id', familyId)
    .neq('status', 'complete')
    .order('sort_order', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false });
  return (data ?? []) as Homework[];
}

// ── Resources ─────────────────────────────────────────────────────────

export async function getSessionResources(sessionNumber: number): Promise<Resource[]> {
  // Two-step: resolve session_number → session.id, then fetch resources for that session.
  const { data: sess } = await supabase
    .from('lcp_sessions')
    .select('id')
    .eq('session_number', sessionNumber)
    .maybeSingle();
  if (!sess) return [];

  const { data } = await supabase
    .from('lcp_resources')
    .select('id, session_id, kind, audience, title, drive_url, created_at, content, response_prompt, due_date, locked, sort_order')
    .eq('session_id', sess.id)
    .eq('audience', 'participant')
    .order('sort_order', { ascending: true });

  return (data ?? []) as Resource[];
}

export async function getResourceCompletions(familyId: string): Promise<ResourceCompletion[]> {
  const { data } = await supabase
    .from('lcp_resource_completions')
    .select('*')
    .eq('family_id', familyId);
  // Table doesn't exist until migration 0040 — return empty array on error.
  return (data as ResourceCompletion[]) ?? [];
}

export async function completeResource(
  resourceId: string,
  familyId: string,
  responseText?: string,
): Promise<void> {
  await supabase
    .from('lcp_resource_completions')
    .upsert(
      { resource_id: resourceId, family_id: familyId, response_text: responseText ?? null },
      { onConflict: 'family_id,resource_id' },
    );
}

export async function uncompleteResource(resourceId: string, familyId: string): Promise<void> {
  await supabase
    .from('lcp_resource_completions')
    .delete()
    .eq('resource_id', resourceId)
    .eq('family_id', familyId);
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

function weekBounds(): { start: string; end: string } {
  const now = new Date();
  const sun = new Date(now);
  sun.setDate(now.getDate() - now.getDay()); // back to Sunday
  sun.setHours(0, 0, 0, 0);
  const sat = new Date(sun);
  sat.setDate(sun.getDate() + 6);
  sat.setHours(23, 59, 59, 999);
  return { start: sun.toISOString(), end: sat.toISOString() };
}

export async function getThisWeekEvents(): Promise<LcpEvent[]> {
  const { start, end } = weekBounds();
  const { data } = await supabase
    .from('lcp_events')
    .select('id, kind, title, starts_at, ends_at, location, mandatory, rsvp_enabled')
    .gte('starts_at', start)
    .lte('starts_at', end)
    .order('starts_at', { ascending: true });
  return (data as LcpEvent[]) ?? [];
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

export async function sendMessage(
  familyId: string,
  body: string,
  voice?: { url: string; duration: number },
  imageUrl?: string,
  replyToId?: string,
): Promise<void> {
  await supabase.from('lcp_messages').insert({
    family_id: familyId,
    sender_kind: 'family',
    body,
    ...(voice ? { voice_url: voice.url, voice_duration: voice.duration } : {}),
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(replyToId ? { reply_to_id: replyToId } : {}),
  });
}

export async function uploadLcpVoice(blob: Blob, familyId: string): Promise<{ url: string }> {
  const ext = blob.type.includes('mp4') || blob.type.includes('aac') ? 'm4a' : 'webm';
  const path = `${familyId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('lcp-voice-messages')
    .upload(path, blob, { contentType: blob.type || 'audio/webm' });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('lcp-voice-messages').getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function uploadLcpImage(file: File, familyId: string): Promise<{ url: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${familyId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('lcp-images')
    .upload(path, file, { contentType: file.type || 'image/jpeg' });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('lcp-images').getPublicUrl(path);
  return { url: data.publicUrl };
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

// ── Goals (participant read + respond only) ───────────────────────────

export async function getGoals(familyId: string): Promise<Goal[]> {
  const { data } = await supabase
    .from('lcp_goals')
    .select('id, family_id, area, title, due_date, status, created_at, updated_at, met_at')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });
  return (data as Goal[]) ?? [];
}

export async function getGoalResponses(familyId: string): Promise<GoalResponse[]> {
  const { data } = await supabase
    .from('lcp_goal_responses')
    .select('id, goal_id, family_id, response, note, created_at')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });
  return (data as GoalResponse[]) ?? [];
}

export async function submitGoalResponse(
  goalId: string,
  familyId: string,
  response: 'met' | 'needs_time',
  note?: string,
): Promise<void> {
  await supabase
    .from('lcp_goal_responses')
    .insert({ goal_id: goalId, family_id: familyId, response, note: note ?? null });
}

// ── Finance milestones (participant read only) ────────────────────────

export async function getFinanceMilestones(): Promise<FinanceMilestone[]> {
  const { data } = await supabase
    .from('lcp_finance_milestones')
    .select('id, sort_order, title, description')
    .order('sort_order');
  return (data as FinanceMilestone[]) ?? [];
}

export async function getMilestoneProgress(familyId: string): Promise<FamilyMilestoneProgress[]> {
  const { data } = await supabase
    .from('lcp_family_milestone_progress')
    .select('id, family_id, milestone_id, completed_at')
    .eq('family_id', familyId);
  return (data as FamilyMilestoneProgress[]) ?? [];
}

// ── Message actions (migration 0054) ─────────────────────────────────

export async function deleteLcpMessage(messageId: string): Promise<void> {
  await supabase.from('lcp_messages').delete().eq('id', messageId);
}

export async function editLcpMessage(messageId: string, newBody: string): Promise<void> {
  await supabase
    .from('lcp_messages')
    .update({ body: newBody, edited_at: new Date().toISOString() })
    .eq('id', messageId);
}

export async function fetchLcpReactions(familyId: string): Promise<MessageReaction[]> {
  const { data, error } = await supabase
    .from('lcp_message_reactions')
    .select('id, message_id, user_id, emoji')
    .eq('family_id', familyId);
  if (error) return []; // table doesn't exist until 0054
  return (data ?? []) as MessageReaction[];
}

export async function addLcpReaction(familyId: string, messageId: string, emoji: string): Promise<void> {
  await supabase
    .from('lcp_message_reactions')
    .upsert({ family_id: familyId, message_id: messageId, emoji }, { onConflict: 'message_id,user_id,emoji' });
}

export async function removeLcpReaction(messageId: string, emoji: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('lcp_message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', user.id)
    .eq('emoji', emoji);
}
