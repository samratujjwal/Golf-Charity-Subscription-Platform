import { Link } from "@tanstack/react-router";
import DashboardCard from "../../components/ui/DashboardCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { useLatestDraw } from "../../hooks/useDraw";
import { useMyWinnings } from "../../hooks/useWinnings";
import { useScores } from "../../hooks/useScores";

function DrawNumber({ number, matched }) {
  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition ${
        matched
          ? "border-2 border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.4)]"
          : "border border-slate-700 bg-slate-900/60 text-slate-400"
      }`}
    >
      {number}
    </span>
  );
}

export default function DashboardDraw() {
  const latestDrawQuery = useLatestDraw();
  const winningsQuery = useMyWinnings();
  const scoresQuery = useScores();

  const draw = latestDrawQuery.data?.draw;
  const userResult = latestDrawQuery.data?.userResult;
  const winnings = winningsQuery.data || [];
  const scores = scoresQuery.data?.scores || [];

  // Participation summary: count unique draws the user has a winning entry for
  const drawsEntered = winnings.length;
  const totalPrizeWon = winnings.reduce(
    (sum, w) => sum + Number(w.prizeAmount || 0),
    0,
  );
  const pendingWinnings = winnings.filter((w) => w.status === "pending").length;

  // Month name helper
  const monthName = (month) =>
    new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" });

  if (latestDrawQuery.isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/50 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Monthly Draw
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Your draw participation & results.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Each month your five Stableford scores are matched against the draw
          numbers. Match 3 or more to win a share of the prize pool.
        </p>
      </section>

      {/* Participation summary — PRD §10 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Draws Entered"
          value={String(drawsEntered)}
          description="Total draw cycles you have matched numbers in"
        />
        <DashboardCard
          title="Total Prize Won"
          value={`$${totalPrizeWon.toFixed(2)}`}
          description="Combined prize amount across all winnings"
        />
        <DashboardCard
          title="Pending Reviews"
          value={String(pendingWinnings)}
          description="Winnings awaiting proof upload or admin verification"
        />
        <DashboardCard
          title="Scores Submitted"
          value={`${scores.length}/5`}
          description="Active Stableford scores entered this cycle"
        />
      </div>

      {/* Latest draw results */}
      {latestDrawQuery.isError && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {latestDrawQuery.error?.response?.data?.error ||
            "Unable to load draw data."}
        </div>
      )}

      {!draw && !latestDrawQuery.isError && (
        <DashboardCard
          title="No Draw Available"
          description="No draw has been run yet this month. Check back after the monthly draw is published."
        />
      )}

      {draw && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Draw numbers + match result */}
          <DashboardCard
            title={`${monthName(draw.month)} ${draw.year} Draw`}
            badge={
              <StatusBadge status={draw.status}>
                {draw.publishedAt ? "Published" : draw.status}
              </StatusBadge>
            }
            description="The five numbers drawn for this month. Matched numbers are highlighted."
          >
            <div className="space-y-6">
              {/* Draw numbers */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Draw numbers
                </p>
                <div className="flex flex-wrap gap-3">
                  {draw.numbers?.map((num) => (
                    <DrawNumber
                      key={num}
                      number={num}
                      matched={userResult?.matchedNumbers?.includes(num)}
                    />
                  ))}
                </div>
              </div>

              {/* User's scores for reference */}
              {scores.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Your scores
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scores.map((score, idx) => {
                      const isMatch = userResult?.matchedNumbers?.includes(
                        score.value,
                      );
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl px-3 py-2 text-center ${
                            isMatch
                              ? "border border-emerald-400/40 bg-emerald-500/10"
                              : "border border-slate-700 bg-slate-900/40"
                          }`}
                        >
                          <p
                            className={`text-lg font-bold ${isMatch ? "text-emerald-300" : "text-slate-300"}`}
                          >
                            {score.value}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(score.date).toLocaleDateString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {scores.length === 0 && (
                <div className="rounded-[1.5rem] border border-dashed border-slate-700 bg-slate-900/30 px-4 py-6 text-center text-sm text-slate-400">
                  No scores submitted yet.{" "}
                  <Link
                    to="/dashboard/scores"
                    className="font-semibold text-indigo-300 hover:text-indigo-200"
                  >
                    Add your scores
                  </Link>{" "}
                  to participate in next month's draw.
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Match result panel */}
          <div className="space-y-4">
            {userResult ? (
              <DashboardCard
                title="Your Result"
                description="Based on your submitted scores matched against this month's draw numbers."
              >
                <div className="space-y-4">
                  {/* Match count ring */}
                  <div
                    className={`flex items-center gap-4 rounded-2xl p-5 ${
                      userResult.isWinner
                        ? "border border-emerald-400/30 bg-emerald-500/10"
                        : "border border-slate-700 bg-slate-900/40"
                    }`}
                  >
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${
                        userResult.isWinner
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {userResult.matchCount}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {userResult.isWinner ? "🏆 Winner!" : "Matches"}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {userResult.matchCount} number
                        {userResult.matchCount !== 1 ? "s" : ""} matched
                      </p>
                      {!userResult.isWinner && userResult.matchCount > 0 && (
                        <p className="mt-1 text-sm text-slate-500">
                          Need 3+ matches to win. Keep playing!
                        </p>
                      )}
                      {userResult.matchCount === 0 && (
                        <p className="mt-1 text-sm text-slate-500">
                          No matches this month. Better luck next draw!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Matched numbers */}
                  {userResult.matchedNumbers?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Matched numbers
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {userResult.matchedNumbers.map((num) => (
                          <span
                            key={num}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20 text-sm font-bold text-emerald-300"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Winning status if applicable */}
                  {userResult.isWinner && userResult.winningStatus && (
                    <div className="surface-muted rounded-xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Payout status
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <StatusBadge status={userResult.winningStatus} />
                        {userResult.prizeAmount > 0 && (
                          <span className="font-bold text-emerald-400">
                            ${Number(userResult.prizeAmount).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {userResult.winningStatus === "pending" && (
                        <p className="mt-2 text-sm text-slate-400">
                          Upload your proof screenshot in the{" "}
                          <Link
                            to="/dashboard/winnings"
                            className="font-semibold text-indigo-300 hover:text-indigo-200"
                          >
                            Winnings tab
                          </Link>
                          .
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </DashboardCard>
            ) : (
              <DashboardCard
                title="Result Pending"
                description="Draw results are calculated after the monthly draw is run and published."
              >
                <p className="text-sm text-slate-400">
                  Make sure your scores are up to date before the draw runs.{" "}
                  <Link
                    to="/dashboard/scores"
                    className="font-semibold text-indigo-300 hover:text-indigo-200"
                  >
                    Manage scores →
                  </Link>
                </p>
              </DashboardCard>
            )}

            {/* Draw info */}
            <DashboardCard title="Draw Details">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Period</dt>
                  <dd className="font-semibold text-white">
                    {monthName(draw.month)} {draw.year}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Type</dt>
                  <dd className="capitalize text-slate-300">{draw.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <StatusBadge status={draw.status} />
                  </dd>
                </div>
                {draw.publishedAt && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Published</dt>
                    <dd className="text-slate-300">
                      {new Date(draw.publishedAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500 leading-6">
                  Prize tiers:{" "}
                  <span className="text-white">5 matches = 40%</span> ·{" "}
                  <span className="text-white">4 matches = 35%</span> ·{" "}
                  <span className="text-white">3 matches = 25%</span> of the
                  prize pool. Jackpot rolls over if no 5-match winner.
                </p>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {/* Winning history */}
      {winnings.length > 0 && (
        <DashboardCard
          title="Your Winning History"
          description="All draws where you matched 3 or more numbers."
        >
          <div className="table-shell">
            <table>
              <thead>
                <tr className="text-slate-500">
                  <th>Draw</th>
                  <th>Matches</th>
                  <th>Prize</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {winnings.map((winning) => (
                  <tr key={winning.id} className="text-slate-300">
                    <td className="font-semibold text-white">
                      {winning.draw
                        ? `${monthName(winning.draw.month)} ${winning.draw.year}`
                        : "Unknown"}
                    </td>
                    <td>
                      <StatusBadge>{`${winning.matchCount} matches`}</StatusBadge>
                    </td>
                    <td className="font-bold text-emerald-400">
                      ${Number(winning.prizeAmount || 0).toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={winning.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
