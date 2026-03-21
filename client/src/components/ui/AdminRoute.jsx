import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return (
      <section className="mx-auto max-w-xl rounded-[2rem] border border-white/40 bg-white/85 p-8 text-center shadow-[0_24px_80px_rgba(20,57,44,0.16)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">Checking access</p>
        <h1 className="mt-3 font-serif text-3xl text-stone-900">Loading admin workspace</h1>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
