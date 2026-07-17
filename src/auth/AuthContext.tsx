import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Family } from '@/lib/types';

interface AuthState {
  session: Session | null;
  family: Family | null;
  loading: boolean;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
  signOut: () => Promise<void>;
  refreshFamily: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  family: null,
  loading: true,
  passwordRecovery: false,
  clearPasswordRecovery: () => {},
  signOut: async () => {},
  refreshFamily: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  // Set when the user arrives via a "reset your password" email link — the
  // session is technically valid at that point, but the intent is for them to
  // set a new password, not land straight in the dashboard.
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  // Track the Supabase session (persists across reloads — no repeated login codes).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadFamily(active: { current: boolean }) {
    if (!session) {
      setFamily(null);
      setLoading(false);
      return;
    }
    // The family is the one whose auth_id was linked on first sign-up (RLS returns
    // only your own row). maybeSingle tolerates a signed-in account with no family.
    const { data } = await supabase
      .from('families')
      .select('id, display_name, login_email, status, current_session_number, housing_savings_cents')
      .maybeSingle();
    if (active.current) {
      setFamily((data as Family) ?? null);
      setLoading(false);
    }
  }

  // Load the family profile for the current session.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const active = { current: true };
    void loadFamily(active);
    return () => {
      active.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function refreshFamily() {
    await loadFamily({ current: true });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setFamily(null);
    setPasswordRecovery(false);
  }

  function clearPasswordRecovery() {
    setPasswordRecovery(false);
  }

  return (
    <AuthContext.Provider
      value={{ session, family, loading, passwordRecovery, clearPasswordRecovery, signOut, refreshFamily }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
