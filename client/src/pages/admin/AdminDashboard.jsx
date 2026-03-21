import DashboardCard from '../../components/ui/DashboardCard';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonBlock from '../../components/ui/SkeletonBlock';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAdminAnalytics } from '../../hooks/useAdmin';

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function AdminDashboard() {
  const analyticsQuery = useAdminAnalytics();

  if (analyticsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-32" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-40" />
        </div>
      </div>
    );
  }

  if (analyticsQuery.isError) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {analyticsQuery.error?.response?.data?.error || 'Unable to load admin analytics.'}
      </div>
    );
  }

  const analytics = analyticsQuery.data || {};
  const summary = analytics.summary || {};
  const metrics = analytics.metrics || {};
  const drawStatistics = metrics.drawStatistics || {};
  const recentActivity = analytics.recentActivity || {};
  const recentUsers = Array.isArray(recentActivity.users) ? recentActivity.users : [];
  const recentDraws = Array.isArray(recentActivity.draws) ? recentActivity.draws : [];
  const recentWinnings = Array.isArray(recentActivity.winnings) ? recentActivity.winnings : [];
  const winDistribution = Array.isArray(metrics.winDistribution) ? metrics.winDistribution : [];

  return (
    <div className="space-y-6">
      <section className="section-hero">
        <p className="section-label">Admin analytics</p>
        <h1 className="section-title">Platform-wide oversight across users, revenue, draws, payouts, and charity impact.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          These metrics are calculated directly from live MongoDB records so the admin team can monitor growth, cash flow, reward exposure, and community contributions in one place.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Total Users" value={String(summary.totalUsers ?? 0)} description="Registered accounts across the platform." />
        <DashboardCard title="Active Subscriptions" value={String(summary.activeSubscriptions ?? 0)} description="Members with active premium access." />
        <DashboardCard title="Monthly Revenue" value={formatCurrency(summary.monthlyRevenue)} description="Successful Stripe revenue captured this month." />
        <DashboardCard title="Total Prize Pool" value={formatCurrency(summary.totalPrizePool)} description="All distributable pool value recorded so far." />
        <DashboardCard title="Total Winnings Paid" value={formatCurrency(summary.totalWinningsPaid)} description="Completed payouts to verified winners." />
        <DashboardCard title="Charity Contributions" value={formatCurrency(summary.charityContributionTotal)} description="Donations attributed to member subscriptions." />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Conversion Rate" value={`${Number(metrics.conversionRate || 0).toFixed(2)}%`} description="Active subscriptions divided by total users." />
        <DashboardCard title="ARPU" value={formatCurrency(metrics.avgRevenuePerUser)} description="Average lifetime revenue per registered user." />
        <DashboardCard title="Payout Ratio" value={`${Number(metrics.payoutRatio || 0).toFixed(2)}%`} description="Paid winnings as a share of total prize pool." />
        <DashboardCard title="Total Draws" value={String(drawStatistics.totalDraws ?? summary.drawCount ?? 0)} description="Recorded draw cycles in the system." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard title="Winner Distribution" description="Distribution of winning entries by match tier.">
          {winDistribution.length === 0 ? (
            <EmptyState title="No winner data yet" description="Winner distribution will appear here once draws produce qualified winning entries." />
          ) : (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {winDistribution.map((entry) => (
                    <tr key={entry.matchCount}>
                      <td className="font-semibold text-white">{entry.matchCount} matches</td>
                      <td><StatusBadge>{`${entry.count} winners`}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Recent Activity" description="Latest operational events across users, draws, and winnings.">
          <div className="space-y-5">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">New users</p>
              <div className="mt-3 space-y-2">
                {recentUsers.length === 0 ? (
                  <div className="surface-muted rounded-xl px-4 py-4 text-sm text-slate-400">No recent users found.</div>
                ) : (
                  recentUsers.map((user) => (
                    <div key={user._id} className="surface-muted flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{user.name}</p>
                        <p className="truncate text-slate-400">{user.email}</p>
                      </div>
                      <span className="text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Recent draws</p>
              <div className="mt-3 space-y-2">
                {recentDraws.length === 0 ? (
                  <div className="surface-muted rounded-xl px-4 py-4 text-sm text-slate-400">No draw activity yet.</div>
                ) : (
                  recentDraws.map((draw) => (
                    <div key={draw._id} className="surface-muted flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-white">{draw.month}/{draw.year}</p>
                        <p className="text-slate-400 capitalize">{draw.type} draw</p>
                      </div>
                      <StatusBadge status={draw.status} />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Recent winnings</p>
              <div className="mt-3 space-y-2">
                {recentWinnings.length === 0 ? (
                  <div className="surface-muted rounded-xl px-4 py-4 text-sm text-slate-400">No winnings recorded yet.</div>
                ) : (
                  recentWinnings.map((winning) => (
                    <div key={winning._id} className="surface-muted flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-white">{winning.userId?.name || 'Unknown user'}</p>
                        <p className="text-slate-400">{winning.matchCount} matches</p>
                      </div>
                      <StatusBadge status={winning.status} />
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
