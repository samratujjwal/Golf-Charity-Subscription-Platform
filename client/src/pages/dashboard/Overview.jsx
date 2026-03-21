import { Link } from '@tanstack/react-router';
import DashboardCard from '../../components/ui/DashboardCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useSubscription } from '../../hooks/useSubscription';
import { useUser } from '../../hooks/useUser';

export default function DashboardOverview() {
  const userQuery = useUser();
  const subscriptionQuery = useSubscription();

  if (userQuery.isLoading || subscriptionQuery.isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-[0_20px_70px_rgba(244,63,94,0.12)]">
        {userQuery.error?.response?.data?.error || 'Unable to load dashboard overview.'}
      </div>
    );
  }

  const user = userQuery.data;
  const subscription = subscriptionQuery.data;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/50 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Overview</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Welcome back, {user.name}.</h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Track your membership, billing status, and upcoming premium features from one central workspace.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="User Name" value={user.name} description="Primary account holder" />
        <DashboardCard title="Email" value={user.email} description="Used for auth and billing notices" />
        <DashboardCard
          title="Subscription Status"
          value={subscription?.status || 'Inactive'}
          badge={<StatusBadge status={subscription?.status || 'inactive'} />}
          description="Verified from the backend subscription API"
        />
        <DashboardCard
          title="Current Plan"
          value={subscription?.plan || 'None'}
          description={subscription ? 'Plan synced from Stripe-backed records' : 'Choose a plan to unlock premium access'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardCard
          title="Renewal"
          value={subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Not scheduled'}
          description="Your current access window based on the active subscription record"
        />
        <DashboardCard title="Next Step" description="Upgrade, renew, or manage your plan from the subscription workspace.">
          <Link
            to="/dashboard/subscription"
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open subscription panel
          </Link>
        </DashboardCard>
      </div>
    </div>
  );
}
