import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getCurrentSubscription } from '../services/subscription';

export default function Account() {
  const { user, logout, refetchUser } = useAuth();
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await getCurrentSubscription();
        setSubscription(response.data.data);
      } catch (subscriptionError) {
        setSubscription(null);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    loadSubscription();
  }, []);

  const handleRefreshProfile = async () => {
    setError('');
    setIsRefreshing(true);

    try {
      await refetchUser();
      const response = await getCurrentSubscription();
      setSubscription(response.data.data);
    } catch (refreshError) {
      setError(refreshError.response?.data?.error || 'Unable to refresh profile');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/40 bg-white/85 p-8 shadow-[0_24px_80px_rgba(20,57,44,0.16)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">Member account</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900">Membership and billing overview</h1>
      <p className="mt-3 text-stone-600">
        Authentication is handled with short-lived access tokens, and premium access depends on the verified subscription record in the database.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Name</p>
          <p className="mt-2 text-xl font-semibold text-stone-900">{user?.name}</p>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Email</p>
          <p className="mt-2 text-xl font-semibold text-stone-900">{user?.email}</p>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Role</p>
          <p className="mt-2 text-xl font-semibold text-stone-900">{user?.role}</p>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Subscription</p>
          <p className="mt-2 text-xl font-semibold text-stone-900">
            {isLoadingSubscription ? 'Checking...' : subscription?.status || 'Inactive'}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Current plan</p>
        {subscription ? (
          <div className="mt-3 grid gap-2 text-stone-700 md:grid-cols-3">
            <p><strong>Plan:</strong> {subscription.plan}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Ends:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-stone-600">No active subscription is attached to this account yet.</p>
            <Link to="/pricing" className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
              View plans
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRefreshProfile}
          disabled={isRefreshing}
          className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh account'}
        </button>

        <Link
          to="/pricing"
          className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Manage subscription
        </Link>

        <button
          type="button"
          onClick={logout}
          className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Logout
        </button>
      </div>
    </section>
  );
}
