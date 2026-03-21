import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCreateDraw, useLatestDraw, useRunDraw, useSimulateDraw } from '../../hooks/useDraw';
import DashboardCard from '../../components/ui/DashboardCard';
import StatusBadge from '../../components/ui/StatusBadge';

function NumberBall({ value, matched = false }) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold shadow-sm transition ${
        matched
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      {value}
    </div>
  );
}

export default function DashboardDraw() {
  const { user } = useAuth();
  const latestDrawQuery = useLatestDraw();
  const createDrawMutation = useCreateDraw();
  const simulateDrawMutation = useSimulateDraw();
  const runDrawMutation = useRunDraw();
  const [form, setForm] = useState({
    type: 'random',
    strategy: 'most_frequent',
  });
  const [actionError, setActionError] = useState('');

  const latestData = latestDrawQuery.data;
  const draw = latestData?.draw || null;
  const userResult = latestData?.userResult || null;
  const simulation = simulateDrawMutation.data?.data?.data || null;
  const isAdmin = user?.role === 'admin';

  const distributionEntries = useMemo(() => {
    const distribution = simulation?.matchDistribution || {};
    return [0, 1, 2, 3, 4, 5].map((key) => ({
      label: `${key} match${key === 1 ? '' : 'es'}`,
      value: distribution[key] ?? 0,
    }));
  }, [simulation]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreate = async () => {
    setActionError('');

    try {
      await createDrawMutation.mutateAsync(form);
    } catch (error) {
      setActionError(error.response?.data?.error || 'Unable to create draw');
    }
  };

  const handleSimulate = async () => {
    setActionError('');

    try {
      await simulateDrawMutation.mutateAsync(form);
    } catch (error) {
      setActionError(error.response?.data?.error || 'Unable to simulate draw');
    }
  };

  const handleRun = async () => {
    setActionError('');

    try {
      await runDrawMutation.mutateAsync();
      await latestDrawQuery.refetch();
    } catch (error) {
      setActionError(error.response?.data?.error || 'Unable to run draw');
    }
  };

  if (latestDrawQuery.isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  if (latestDrawQuery.isError) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-[0_20px_70px_rgba(244,63,94,0.12)]">
        {latestDrawQuery.error?.response?.data?.error || 'Unable to load draw information.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/50 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Draw Engine</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Monthly results, simulations, and match insights.</h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Each cycle generates five unique numbers, compares them against stored user scores, and identifies winners with three, four, or five matches.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard
          title="Latest Draw"
          value={draw ? `${draw.month}/${draw.year}` : 'No draw yet'}
          badge={draw ? <StatusBadge status={draw.status} /> : null}
          description={
            draw
              ? `${draw.type === 'algorithm' ? 'Algorithm-based' : 'Random'} draw with five unique numbers.`
              : 'Create the first draw for the current monthly cycle to start simulations and winner matching.'
          }
        >
          {draw ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {draw.numbers.map((number) => (
                  <NumberBall
                    key={number}
                    value={number}
                    matched={Boolean(userResult?.matchedNumbers?.includes(number))}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600">
                Created {new Date(draw.createdAt).toLocaleString()} and currently marked as {draw.status}.
              </p>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-600">
              No monthly draw is available yet.
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Your Match Result"
          value={userResult ? `${userResult.matchCount}/5` : 'No result'}
          badge={userResult?.isWinner ? <StatusBadge>Winner</StatusBadge> : <StatusBadge>Watching</StatusBadge>}
          description="Your latest five stored scores are compared against the current draw using backend-calculated matching logic."
        >
          {!draw ? (
            <p className="text-sm leading-7 text-slate-600">Once the draw exists, your personal match summary will appear here.</p>
          ) : userResult?.matchedNumbers?.length ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {userResult.matchedNumbers.map((number) => (
                  <NumberBall key={number} value={number} matched />
                ))}
              </div>
              <p className="text-sm text-slate-600">
                {userResult.isWinner
                  ? `You currently qualify as a winner with ${userResult.matchCount} matches.`
                  : `You have ${userResult.matchCount} matches so far. Three matches or more creates a winnings record.`}
              </p>
              {userResult.winningStatus ? <StatusBadge status={userResult.winningStatus} /> : null}
            </div>
          ) : (
            <p className="text-sm leading-7 text-slate-600">
              No matches yet. Keep adding strong Stableford rounds to improve your odds in future cycles.
            </p>
          )}
        </DashboardCard>
      </div>

      {isAdmin && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <DashboardCard
            title="Admin Controls"
            description="Create this month’s draw, run simulations without touching the database, or execute the live draw once."
          >
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Draw type</span>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-950"
                  >
                    <option value="random">Random</option>
                    <option value="algorithm">Algorithm</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Algorithm strategy</span>
                  <select
                    name="strategy"
                    value={form.strategy}
                    onChange={handleChange}
                    disabled={form.type !== 'algorithm'}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="most_frequent">Most frequent</option>
                    <option value="least_frequent">Least frequent</option>
                  </select>
                </label>
              </div>

              {actionError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {actionError}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={createDrawMutation.isPending}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createDrawMutation.isPending ? 'Creating draw...' : 'Create monthly draw'}
                </button>
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={simulateDrawMutation.isPending}
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {simulateDrawMutation.isPending ? 'Running simulation...' : 'Simulate outcome'}
                </button>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={runDrawMutation.isPending}
                  className="rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {runDrawMutation.isPending ? 'Executing draw...' : 'Run live draw'}
                </button>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Simulation Snapshot"
            description="Preview likely winners and match distribution without creating winnings or mutating the draw state."
          >
            {!simulation && (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-600">
                Run a simulation to inspect projected winners and match distribution.
              </div>
            )}

            {simulation && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Simulated numbers</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {simulation.draw.numbers.map((number) => (
                      <NumberBall key={`simulation-${number}`} value={number} />
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {distributionEntries.map((entry) => (
                    <div key={entry.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{entry.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{entry.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Predicted winners</p>
                    <StatusBadge>{`${simulation.totalWinners} total`}</StatusBadge>
                  </div>

                  {simulation.predictedWinners.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      No winners were predicted for this simulation.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {simulation.predictedWinners.slice(0, 8).map((winner) => (
                        <div key={`${winner.user.id}-${winner.matchCount}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">{winner.user.name}</p>
                              <p className="text-sm text-slate-600">{winner.user.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge>{`${winner.matchCount} matches`}</StatusBadge>
                              <div className="flex flex-wrap gap-2">
                                {winner.matchedNumbers.map((number) => (
                                  <NumberBall key={`${winner.user.id}-${number}`} value={number} matched />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
