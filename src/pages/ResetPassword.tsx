import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Wordmark } from '@/components/Wordmark';
import { useAuth } from '@/auth/AuthContext';
import { useRequiredFields } from '@/hooks/useRequiredFields';

export function ResetPassword() {
  const { clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { missingMessage, validate, fieldClass, clear } = useRequiredFields([
    { key: 'new-password', label: 'New password', valid: password.length >= 8 },
    { key: 'confirm-password', label: 'Confirm new password', valid: confirm.length >= 8 },
  ]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || busy) return;
    if (password !== confirm) {
      setError('Those passwords don’t match — try again.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm text-center">
        <Wordmark className="justify-center" />
        <h1 className="mt-5 font-serif text-2xl font-semibold">Set a new password</h1>

        {done ? (
          <>
            <p className="mt-2 text-sm text-sparrow-gray">Your password is updated.</p>
            <button onClick={clearPasswordRecovery} className="btn-primary mt-6 w-full">
              Continue
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="field-label" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clear('new-password'); }}
                className={fieldClass('new-password')}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); clear('confirm-password'); }}
                className={fieldClass('confirm-password')}
              />
            </div>

            {missingMessage && <p className="text-sm text-red-600">{missingMessage}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
