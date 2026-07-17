import { useState, type FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Wordmark } from '@/components/Wordmark';
import { MissionFooter } from '@/components/MissionFooter';

type Mode = 'sign-in' | 'sign-up' | 'reset-request';

export function Login() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    // Trim + lowercase so a stray space or different casing (easy to introduce via
    // copy-paste) doesn't fail to match the roster email staff added on their side.
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'reset-request') {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: window.location.origin,
      });
      // Same confident message either way — no need to hedge just because we're
      // deliberately not revealing whether the email is on file.
      setNotice(error ? error.message : 'Check your email — a reset link is on its way.');
    } else if (mode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) setError('That email or password didn’t work. Want to create your password instead?');
      // success: AuthContext picks up the session automatically.
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        // The DB trigger rejects emails that aren't on the LifeChange roster.
        setError(
          /roster|Database error/i.test(error.message)
            ? 'We don’t recognize that email yet. Please check with your Sparrow staff.'
            : error.message,
        );
      } else if (!data.session) {
        setNotice('Almost there — check your email to confirm your account, then sign in.');
        setMode('sign-in');
      }
      // if a session came back, AuthContext takes over.
    }
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm text-center">
        <Wordmark className="justify-center" />
        <h1 className="mt-5 font-serif text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-sparrow-gray">Your LifeChange journey, in one place.</p>

        {isSupabaseConfigured ? (
          <form onSubmit={submit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </div>
            {mode !== 'reset-request' && (
              <div>
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                />
              </div>
            )}

            {mode === 'sign-in' && (
              <button
                type="button"
                onClick={() => { setMode('reset-request'); setError(null); setNotice(null); }}
                className="text-xs font-medium text-sparrow-green underline"
              >
                Forgot your password?
              </button>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {notice && <p className="text-sm text-sparrow-green">{notice}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy
                ? 'One moment…'
                : mode === 'sign-in'
                  ? 'Sign in'
                  : mode === 'reset-request'
                    ? 'Send reset link'
                    : 'Create my account'}
            </button>

            {mode === 'reset-request' ? (
              <p className="text-center text-sm text-sparrow-gray">
                <button
                  type="button"
                  onClick={() => { setMode('sign-in'); setError(null); setNotice(null); }}
                  className="font-medium text-sparrow-green underline"
                >
                  Back to sign in
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-sparrow-gray">
                {mode === 'sign-in' ? 'First time here?' : 'Already have a password?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
                    setError(null);
                    setNotice(null);
                  }}
                  className="font-medium text-sparrow-green underline"
                >
                  {mode === 'sign-in' ? 'Create your password' : 'Sign in'}
                </button>
              </p>
            )}
          </form>
        ) : (
          <div className="mt-6 rounded-lg bg-sparrow-cream p-4 text-left text-sm text-sparrow-ink">
            <p className="font-semibold">Not connected yet.</p>
            <p className="mt-1 text-sparrow-gray">
              Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to{' '}
              <code>.env.local</code>. See <code>README.md</code>.
            </p>
          </div>
        )}
      </div>
      <div className="mt-8 w-full max-w-sm">
        <MissionFooter />
      </div>
    </main>
  );
}
