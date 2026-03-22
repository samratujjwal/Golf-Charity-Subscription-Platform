import { Link } from "@tanstack/react-router";
import DashboardCard from "../../components/ui/DashboardCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { useSubscription } from "../../hooks/useSubscription";

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
        {subscriptionQuery.error?.response?.data?.error ||
          "Unable to load subscription details."}
      </div>
    );
  }

  const subscription = subscriptionQuery.data;

  const daysRemaining = subscription?.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/50 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Subscription
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Billing and access
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Review your current plan, charity contribution percentage, and jump
          back into pricing whenever you want to renew or switch tiers.
        </p>
      </section>

      {/* Core subscription cards */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Current Plan"
          value={
            subscription?.plan
              ? subscription.plan.charAt(0).toUpperCase() +
                subscription.plan.slice(1)
              : "No active plan"
          }
          description="The plan currently attached to your account"
        />
        <DashboardCard
          title="Status"
          value={subscription?.status || "Inactive"}
          badge={<StatusBadge status={subscription?.status || "inactive"} />}
          description="Access updates only after backend verification"
        />
        <DashboardCard
          title="Renewal Date"
          value={
            subscription?.endDate
              ? new Date(subscription.endDate).toLocaleDateString()
              : "Not available"
          }
          description={
            daysRemaining !== null
              ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`
              : "The current billing period end date"
          }
        />
        {/* NEW — PRD §10: show charityPercentage on dashboard */}
        <DashboardCard
          title="Charity Contribution"
          value={
            subscription ? `${subscription.charityPercentage ?? 10}%` : "—"
          }
          description="Of each payment goes to your selected charity"
        />
      </div>

      {/* Subscription amount */}
      {subscription && (
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardCard
            title="Subscription Amount"
            value={`$${Number(subscription.amount || 0).toFixed(2)} / ${subscription.plan}`}
            description="The amount charged per billing cycle via Stripe"
          />
          <DashboardCard
            title="Charity Allocation"
            value={`$${(
              (Number(subscription.amount || 0) *
                (subscription.charityPercentage ?? 10)) /
              100
            ).toFixed(2)} / ${subscription.plan}`}
            description={`${subscription.charityPercentage ?? 10}% of your subscription directed to charity`}
          />
        </div>
      )}

      {/* Billing period */}
      {subscription?.startDate && subscription?.endDate && (
        <DashboardCard
          title="Billing Period"
          description="Your current access window based on the active subscription record."
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 text-sm text-slate-300">
            <div>
              <span className="text-slate-500">Started: </span>
              <span className="font-semibold text-white">
                {new Date(subscription.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="hidden sm:block text-slate-700">→</div>
            <div>
              <span className="text-slate-500">Ends: </span>
              <span className="font-semibold text-white">
                {new Date(subscription.endDate).toLocaleDateString()}
              </span>
            </div>
            {daysRemaining !== null && (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                  daysRemaining <= 7
                    ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                    : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {daysRemaining} days left
              </span>
            )}
          </div>
        </DashboardCard>
      )}

      {/* Actions */}
      <DashboardCard
        title="Actions"
        description="Need to renew, upgrade, or restart access? Use the pricing flow below. To adjust your charity percentage, visit the Charity tab."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to="/pricing"
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Upgrade / Renew
          </Link>
          <Link
            to="/dashboard/charity"
            className="inline-flex rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
          >
            Adjust charity %
          </Link>
        </div>
      </DashboardCard>
    </div>
  );
}
