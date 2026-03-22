import { getErrorMessage } from '../../utils/getErrorMessage';
import { Link } from '@tanstack/react-router';
import DashboardCard from '../../components/ui/DashboardCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useLatestDraw } from '../../hooks/useDraw';
import { useSubscription } from '../../hooks/useSubscription';
import { useUser } from '../../hooks/useUser';
import { useMyWinnings } from '../../hooks/useWinnings';

export default function DashboardOverview() {
  const userQuery = useUser();
  const subscriptionQuery = useSubscription();
  const latestDrawQuery = useLatestDraw({ retry: false });
  const winningsQuery = useMyWinnings({ retry: false });

  const isLoading = userQuery.isLoading || subscriptionQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-[0_20px_70px_rgba(244,63,94,0.12)]">
        {getErrorMessage(userQuery.error, 'Unable to load dashboard overview.')}
      </div>
    );
  }

  const user = userQuery.data;
  const subscription = subscriptionQuery.data;
  const draw = latestDrawQuery.data?.draw;
  const userResult = latestDrawQuery.data?.userResult;
  const winnings = winningsQuery.data || [];

  // Participation summary
  const drawsWon = winnings.length;
  const totalPrize = winnings.reduce((s, w) => s + Number(w.prizeAmount || 0), 0);
  const pendingAction = winnings.filter(
    (w) => w.status === 'pending' || w.status === 'rejected',
  ).length;

  const monthName = (m) =>
    new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      {/* Hero welcome */}
      <section className="rounded-[2rem] border border-white/50 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Overview
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Welcome back, {user.name}.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Track your membership, billing status, draw participation, and charity contributions from
          one central workspace.
        </p>
      </section>

      {/* Account info */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="User Name"
          value={user.name}
          description="Primary account holder"
        />
        <DashboardCard
          title="Email"
          value={user.email}
          description="Used for auth and billing notices"
        />
        <DashboardCard
          title="Subscription Status"
          value={subscription?.status || 'Inactive'}
          badge={<StatusBadge status={subscription?.status || 'inactive'} />}
          description="Verified from the backend subscription API"
        />
        <DashboardCard
          title="Current Plan"
          value={
            subscription?.plan
              ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
              : 'None'
          }
          description={
            subscription
              ? 'Plan synced from Stripe-backed records'
              : 'Choose a plan to unlock premium access'
          }
        />
      </div>

      {/* Subscription details */}
      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardCard
          title="Renewal Date"
          value={
            subscription?.endDate
              ? new Date(subscription.endDate).toLocaleDateString()
              : 'Not scheduled'
          }
          description="Your current access window based on the active subscription record"
        />
        <DashboardCard
          title="Charity Contribution"
          value={subscription ? `${subscription.charityPercentage ?? 10}%` : '—'}
          description="Of each subscription payment directed to your chosen charity"
        />
        <DashboardCard
          title="Next Step"
          description="Upgrade, renew, or manage your plan from the subscription workspace."
        >
          <Link
            to="/dashboard/subscription"
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open subscription panel
          </Link>
        </DashboardCard>
      </div>

      {/* Participation summary — PRD §10 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Draws Won"
          value={String(drawsWon)}
          description="Total draw cycles you have matched 3+ numbers in"
        />
        <DashboardCard
          title="Total Prize Won"
          value={`$${totalPrize.toFixed(2)}`}
          description="Combined prize amount across all winnings"
        />
        <DashboardCard
          title="Pending Actions"
          value={String(pendingAction)}
          description="Winnings needing proof upload or awaiting admin review"
        />
        <DashboardCard
          title="Latest Draw"
          value={draw ? `${monthName(draw.month)} ${draw.year}` : 'No draw yet'}
          badge={draw ? <StatusBadge status={draw.status} /> : null}
          description={
            draw
              ? `Numbers: ${draw.numbers?.join(', ')}`
              : 'No draw has been run yet this month'
          }
        />
      </div>

      {/* Latest draw result for this user */}
      {draw && userResult && (
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardCard
            title={`Your ${monthName(draw.month)} ${draw.year} Result`}
            description="Based on your submitted scores matched against this month's draw numbers."
          >
            <div
              className={`flex items-center gap-4 rounded-2xl p-4 ${
                userResult.isWinner
                  ? 'border border-emerald-200 bg-emerald-50'
                  : 'border border-slate-200 bg-slate-50'
              }`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${
                  userResult.isWinner
                    ? 'bg-emerald-500/20 text-emerald-700'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {userResult.matchCount}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {userResult.isWinner
                    ? `🏆 ${userResult.matchCount} matches — you won!`
                    : userResult.matchCount > 0
                    ? `${userResult.matchCount} match${userResult.matchCount !== 1 ? 'es' : ''} — need 3+ to win`
                    : 'No matches this month'}
                </p>
                {userResult.matchedNumbers?.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {userResult.matchedNumbers.map((n) => (
                      <span
                        key={n}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-700"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
                {userResult.isWinner && userResult.winningStatus && (
                  <div className="mt-2">
                    <StatusBadge status={userResult.winningStatus} />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3">
              <Link
                to="/dashboard/draw"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View full draw details →
              </Link>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Quick Links"
            description="Jump to the sections you need most."
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/dashboard/scores', label: '⛳ Manage scores' },
                { to: '/dashboard/draw', label: '🎯 Draw details' },
                { to: '/dashboard/winnings', label: '🏆 My winnings' },
                { to: '/dashboard/charity', label: '❤️ My charity' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-100 hover:text-slate-950"
                >
                  {label}
                </Link>
              ))}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* If no draw yet — show getting started */}
      {!draw && (
        <DashboardCard
          title="Get started"
          description="No draw has run yet. Make sure your scores are up to date before the monthly draw."
        >
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/scores"
              className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add my scores
            </Link>
            <Link
              to="/dashboard/charity"
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Choose a charity
            </Link>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
