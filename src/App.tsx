import { useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { initOneSignal, loginOneSignal, logoutOneSignal } from '@/lib/push';

initOneSignal();

function Splash({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sparrow-sage">
      <p className="text-sm text-sparrow-gray">{message}</p>
    </div>
  );
}

export function App() {
  const { session, family, loading, signOut } = useAuth();

  useEffect(() => {
    if (family?.id) loginOneSignal(family.id);
  }, [family?.id]);

  useEffect(() => {
    if (!session) logoutOneSignal();
  }, [session]);

  if (loading) return <Splash message="Loading…" />;
  if (!session) return <Login />;

  // Signed in but not linked to a LifeChange family. Shouldn't normally happen — the
  // DB trigger links a family on first sign-up and rejects unknown emails.
  if (!family) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-sm text-center">
          <h1 className="font-serif text-xl font-semibold">We couldn’t find your account</h1>
          <p className="mt-2 text-sm text-sparrow-gray">
            This sign-in isn’t linked to a LifeChange family yet. Please reach out to your Sparrow
            staff and we’ll get it sorted.
          </p>
          <button onClick={signOut} className="btn-primary mt-6 w-full">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
