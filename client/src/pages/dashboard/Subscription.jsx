import { Link } from '@tanstack/react-router';
import DashboardCard from '../../components/ui/DashboardCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useSubscription } from '../../hooks/useSubscription';

export default function DashboardSubscription() {
  const subscriptionQuery = useSubscription();

  if (subscriptionQuery.isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  if (subscriptionQuery.isError) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-[0_20px_70px_rgba(244,63,94,0.12)]">
        {subscriptionQuery.error?.response?.data?.error || 'Unable to load subscription details.'}
      </div>
    );
  }

  const subscription = subscriptionQuery.data;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/50 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Subscription</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Billing and access</h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Review your current plan and jump back into pricing whenever you want to renew or switch tiers.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard
          title="Current Plan"
          value={subscription?.plan || 'No active plan'}
          description="The plan currently attached to your account"
        />
        <DashboardCard
          title="Status"
          value={subscription?.status || 'Inactive'}
          badge={<StatusBadge status={subscription?.status || 'inactive'} />}
          description="Access updates only after backend verification"
        />
        <DashboardCard
          title="Renewal Date"
          value={subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Not available'}
          description="The current billing period end date"
        />
      </div>

      <DashboardCard title="Actions" description="Need to renew, upgrade, or restart access? Use the pricing flow below.">
        <Link
          to="/pricing"
          className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Upgrade / Renew
        </Link>
      </DashboardCard>
    </div>
  );
}
