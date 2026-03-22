import { getErrorMessage } from '../../utils/getErrorMessage';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import DashboardCard from '../../components/ui/DashboardCard';
import SkeletonBlock from '../../components/ui/SkeletonBlock';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  useAdminDrawConfig,
  useAdminDraws,
  useCreateAdminDraw,
  usePublishAdminDraw,
  useRunAdminDraw,
  useSimulateAdminDraw,
  useUpdateAdminDrawConfig,
} from '../../hooks/useAdmin';

const STRATEGIES = ['most_frequent', 'least_frequent'];

export default function AdminDraws() {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);

  // Local draw type + strategy selection (for create / simulate)
  const [selectedType, setSelectedType] = useState('random');
  const [selectedStrategy, setSelectedStrategy] = useState('most_frequent');

  const drawsQuery = useAdminDraws({ page: 1, limit: 20 });
  const drawConfigQuery = useAdminDrawConfig();
  const updateConfigMutation = useUpdateAdminDrawConfig();
  const createDrawMutation = useCreateAdminDraw();
  const simulateDrawMutation = useSimulateAdminDraw();
  const runDrawMutation = useRunAdminDraw();
  const publishDrawMutation = usePublishAdminDraw();

  const draws = drawsQuery.data?.items || [];
  const globalConfig = drawConfigQuery.data;

  const clearMessages = () => { setError(''); setSuccessMessage(''); };

  // ── handlers ────────────────────────────────────────────────

  const handleSetGlobalConfig = async (type) => {
    clearMessages();
    try {
      await updateConfigMutation.mutateAsync(type);
      setSelectedType(type);
      setSuccessMessage(`Global draw mode set to "${type}".`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update draw configuration'));
    }
  };

  const handleCreate = async () => {
    clearMessages();
    setSimulationResult(null);
    try {
      await createDrawMutation.mutateAsync({ type: selectedType, strategy: selectedStrategy });
      setSuccessMessage(`Draw created for this month using ${selectedType} mode.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create draw'));
    }
  };

  const handleSimulate = async () => {
    clearMessages();
    setSimulationResult(null);
    try {
      const response = await simulateDrawMutation.mutateAsync({
        type: selectedType,
        strategy: selectedStrategy,
      });
      setSimulationResult(response.data.data);
      setSuccessMessage('Simulation complete — no data was saved.');
    } catch (err) {
      setError(getErrorMessage(err, 'Simulation failed'));
    }
  };

  const handleRun = async () => {
    clearMessages();
    try {
      await runDrawMutation.mutateAsync();
      setSuccessMessage('Draw executed. Winners have been recorded.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to run draw'));
    }
  };

  const handlePublish = async () => {
    clearMessages();
    try {
      await publishDrawMutation.mutateAsync();
      setSuccessMessage('Results published. Members can now view their results.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to publish draw'));
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <section className="section-hero">
        <p className="section-label">Draw Management</p>
        <h1 className="section-title">Configure, simulate, run, and publish monthly draws.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          Follow the four steps below each month. Simulate first to preview winners before
          committing. Publishing makes results visible to all members.
        </p>
      </section>

      {/* ── Feedback ── */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* ── STEP 1 — Choose draw type ── */}
      <DashboardCard title="Step 1 — Choose draw type">
        <div className="space-y-5">

          {/* Global config display */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span>Global default:</span>
            <span className="font-semibold capitalize text-white">
              {drawConfigQuery.isLoading ? '…' : (globalConfig?.type || 'random')}
            </span>
            <span className="text-slate-600">— override below for this draw only</span>
          </div>

          {/* Random / Algorithm toggle — big clear buttons */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSelectedType('random')}
              className={`rounded-2xl border-2 p-5 text-left transition-all ${
                selectedType === 'random'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 bg-white/5 hover:border-slate-500'
              }`}
            >
              <p className={`text-lg font-bold ${selectedType === 'random' ? 'text-indigo-300' : 'text-slate-300'}`}>
                🎲 Random
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Five numbers drawn at random from 1–45. Standard lottery style.
              </p>
              {selectedType === 'random' && (
                <span className="mt-3 inline-block rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Selected
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('algorithm')}
              className={`rounded-2xl border-2 p-5 text-left transition-all ${
                selectedType === 'algorithm'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-white/5 hover:border-slate-500'
              }`}
            >
              <p className={`text-lg font-bold ${selectedType === 'algorithm' ? 'text-purple-300' : 'text-slate-300'}`}>
                🧠 Algorithm
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Numbers weighted by how frequently members have scored them.
              </p>
              {selectedType === 'algorithm' && (
                <span className="mt-3 inline-block rounded-full bg-purple-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Selected
                </span>
              )}
            </button>
          </div>

          {/* Algorithm strategy — only shown when algorithm is selected */}
          {selectedType === 'algorithm' && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-400">Algorithm strategy</p>
              <div className="flex flex-wrap gap-2">
                {STRATEGIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStrategy(s)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
                      selectedStrategy === s
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {selectedStrategy === 'most_frequent'
                  ? 'Numbers most often scored by members are drawn — rewards common scores.'
                  : 'Numbers least often scored are drawn — harder to match, bigger jackpot potential.'}
              </p>
            </div>
          )}

          {/* Save as global default */}
          <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
            <span className="text-xs text-slate-500">Save as global default:</span>
            <button
              type="button"
              onClick={() => handleSetGlobalConfig(selectedType)}
              disabled={updateConfigMutation.isPending || globalConfig?.type === selectedType}
              className="rounded-full border border-slate-600 px-4 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-indigo-400 hover:text-indigo-300 disabled:opacity-40"
            >
              {updateConfigMutation.isPending ? 'Saving…' : `Set "${selectedType}" as default`}
            </button>
          </div>
        </div>
      </DashboardCard>

      {/* ── STEPS 2–4 — Create / Simulate / Run / Publish ── */}
      <div className="grid gap-4 xl:grid-cols-2">

        {/* Step 2 — Create + Simulate */}
        <DashboardCard title="Step 2 — Create or simulate">
          <p className="mb-4 text-sm leading-6 text-slate-400">
            Creating generates this month's draw numbers using your chosen type. Simulating shows
            a preview of winners without saving anything to the database.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleCreate}
              disabled={createDrawMutation.isPending}
            >
              {createDrawMutation.isPending ? 'Creating…' : `Create draw (${selectedType})`}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSimulate}
              disabled={simulateDrawMutation.isPending}
            >
              {simulateDrawMutation.isPending ? 'Simulating…' : 'Run simulation'}
            </Button>
          </div>
        </DashboardCard>

        {/* Steps 3 & 4 — Run + Publish */}
        <DashboardCard title="Steps 3 & 4 — Run then publish">
          <p className="mb-4 text-sm leading-6 text-slate-400">
            Running evaluates all subscriber scores against the draw numbers and records winners.
            Publishing makes results visible to members — do this only after running.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleRun}
              disabled={runDrawMutation.isPending}
            >
              {runDrawMutation.isPending ? 'Running…' : 'Run this month\'s draw'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handlePublish}
              disabled={publishDrawMutation.isPending}
            >
              {publishDrawMutation.isPending ? 'Publishing…' : 'Publish results'}
            </Button>
          </div>

          {/* Quick order reminder */}
          <ol className="mt-5 space-y-1 border-t border-slate-800 pt-4 text-xs text-slate-500">
            <li><span className="text-indigo-400 font-bold">1.</span> Pick type above → Create draw</li>
            <li><span className="text-indigo-400 font-bold">2.</span> Optionally simulate to preview</li>
            <li><span className="text-indigo-400 font-bold">3.</span> Run draw — records winners</li>
            <li><span className="text-indigo-400 font-bold">4.</span> Publish — members see results</li>
          </ol>
        </DashboardCard>
      </div>

      {/* ── Simulation Results ── */}
      {simulationResult && (
        <DashboardCard
          title="Simulation Results"
          badge={<StatusBadge>Preview only — not saved</StatusBadge>}
          description="These numbers and winners are a preview. Nothing was written to the database."
        >
          <div className="space-y-5">
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="surface-muted rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Draw numbers</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {simulationResult.draw?.numbers?.map((num) => (
                    <span
                      key={num}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-500/10 text-sm font-bold text-indigo-300"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <div className="surface-muted rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Participants</p>
                <p className="mt-3 text-3xl font-semibold text-white">{simulationResult.totalParticipants}</p>
              </div>
              <div className="surface-muted rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Predicted winners</p>
                <p className="mt-3 text-3xl font-semibold text-white">{simulationResult.totalWinners}</p>
              </div>
            </div>

            {/* Match distribution */}
            {simulationResult.matchDistribution && (
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-400">Match distribution</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(simulationResult.matchDistribution)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([matches, count]) => (
                      <div key={matches} className="surface-muted rounded-xl px-4 py-3 text-center">
                        <p className="text-xs text-slate-500">{matches} match{Number(matches) !== 1 ? 'es' : ''}</p>
                        <p className={`mt-1 text-xl font-semibold ${Number(matches) >= 3 ? 'text-emerald-300' : 'text-white'}`}>
                          {count}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Predicted winners table */}
            {simulationResult.predictedWinners?.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-400">Predicted winners</p>
                <div className="table-shell">
                  <table>
                    <thead>
                      <tr className="text-slate-500">
                        <th className="font-semibold">Member</th>
                        <th className="font-semibold">Tier</th>
                        <th className="font-semibold">Matched numbers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.predictedWinners.map((winner, idx) => (
                        <tr key={idx} className="text-slate-300">
                          <td>
                            <p className="font-semibold text-white">{winner.user?.name || 'Unknown'}</p>
                            <p className="text-slate-500 text-sm">{winner.user?.email}</p>
                          </td>
                          <td>
                            <StatusBadge>{`${winner.matchCount} matches`}</StatusBadge>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {winner.matchedNumbers?.map((num) => (
                                <span
                                  key={num}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300"
                                >
                                  {num}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {simulationResult.totalWinners === 0 && (
              <div className="surface-muted rounded-xl px-4 py-6 text-center text-sm text-slate-400">
                No predicted winners with these numbers. The jackpot would roll over to next month.
              </div>
            )}

            {/* Proceed prompt */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
              <p className="text-sm text-slate-400">Happy with the simulation? Create the draw next.</p>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={createDrawMutation.isPending}
              >
                {createDrawMutation.isPending ? 'Creating…' : `Create draw (${selectedType})`}
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* ── Draw History ── */}
      <DashboardCard
        title="Draw History"
        description="All draws recorded in the system, most recent first."
      >
        {drawsQuery.isLoading && (
          <div className="space-y-3">
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
          </div>
        )}

        {drawsQuery.isError && (
          <div className="py-10 text-center text-rose-300">
            {getErrorMessage(drawsQuery.error, 'Unable to load draws')}
          </div>
        )}

        {!drawsQuery.isLoading && !drawsQuery.isError && draws.length === 0 && (
          <div className="surface-muted rounded-xl px-4 py-10 text-center text-sm text-slate-400">
            No draws created yet. Use the controls above to create the first draw.
          </div>
        )}

        {!drawsQuery.isLoading && !drawsQuery.isError && draws.length > 0 && (
          <div className="table-shell">
            <table>
              <thead>
                <tr className="text-slate-500">
                  <th className="font-semibold">Period</th>
                  <th className="font-semibold">Numbers</th>
                  <th className="font-semibold">Type</th>
                  <th className="font-semibold">Status</th>
                  <th className="font-semibold">Published</th>
                  <th className="font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((draw) => (
                  <tr key={draw.id} className="align-middle text-slate-300">
                    <td className="font-semibold text-white">
                      {new Date(draw.year, draw.month - 1).toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {draw.numbers?.map((num) => (
                          <span
                            key={num}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs font-bold"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="capitalize">{draw.type}</td>
                    <td>
                      <StatusBadge status={draw.status} />
                    </td>
                    <td className="text-slate-500">
                      {draw.publishedAt ? new Date(draw.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="text-slate-500">
                      {new Date(draw.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
