import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import DashboardCard from '../../components/ui/DashboardCard';
import EmptyState from '../../components/ui/EmptyState';
import InputField from '../../components/ui/InputField';
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

function NumberBall({ value, highlighted = false }) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-200 ${
        highlighted
          ? 'border-indigo-400 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_12px_30px_rgba(99,102,241,0.35)]'
          : 'border-slate-700 bg-slate-900 text-slate-100'
      }`}
    >
      {value}
    </span>
  );
}

export default function AdminDraws() {
  const [form, setForm] = useState({ type: 'random', strategy: 'most_frequent' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const drawsQuery = useAdminDraws({ page: 1, limit: 24 });
  const drawConfigQuery = useAdminDrawConfig();
  const updateConfigMutation = useUpdateAdminDrawConfig();
  const createMutation = useCreateAdminDraw();
  const simulateMutation = useSimulateAdminDraw();
  const runMutation = useRunAdminDraw();
  const publishMutation = usePublishAdminDraw();

  const draws = Array.isArray(drawsQuery.data?.items) ? drawsQuery.data.items : [];
  const latestDraw = useMemo(() => draws[0] || null, [draws]);
  const simulation = simulateMutation.data?.data?.data || null;
  const isBusy = updateConfigMutation.isPending || createMutation.isPending || simulateMutation.isPending || runMutation.isPending || publishMutation.isPending;

  useEffect(() => {
    if (drawConfigQuery.data?.type) {
      setForm((current) => ({ ...current, type: drawConfigQuery.data.type }));
    }
  }, [drawConfigQuery.data?.type]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleUpdateConfig = async () => {
    setError('');
    setSuccessMessage('');

    try {
      await updateConfigMutation.mutateAsync(form.type);
      setSuccessMessage('Draw configuration updated successfully.');
    } catch (mutationError) {
      setError(mutationError.response?.data?.error || 'Unable to update draw configuration');
    }
  };

  const handleAction = async (action) => {
    setError('');
    setSuccessMessage('');

    try {
      if (action === 'create') {
        await createMutation.mutateAsync(form);
        setSuccessMessage('Draw created successfully.');
      }

      if (action === 'simulate') {
        await simulateMutation.mutateAsync(form);
        setSuccessMessage('Simulation completed successfully.');
      }

      if (action === 'run') {
        await runMutation.mutateAsync();
        setSuccessMessage('Draw executed successfully.');
      }

      if (action === 'publish') {
        await publishMutation.mutateAsync();
        setSuccessMessage('Draw results published successfully.');
      }
    } catch (mutationError) {
      setError(mutationError.response?.data?.error || 'Unable to complete draw action');
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-hero">
        <p className="section-label">Draw management</p>
        <h1 className="section-title">Configure, simulate, execute, and publish the monthly draw safely.</h1>
      </section>

      {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}
      {successMessage ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{successMessage}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardCard title="Draw Controls" description="Choose the generation mode, preview outcomes, and lock published results.">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Configured draw type</p>
                {drawConfigQuery.isLoading ? (
                  <SkeletonBlock className="h-12" />
                ) : drawConfigQuery.isError ? (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">Unable to load draw configuration.</div>
                ) : (
                  <InputField as="select" name="type" value={form.type} onChange={handleChange}>
                    <option value="random">Random</option>
                    <option value="algorithm">Algorithm</option>
                  </InputField>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Algorithm strategy</p>
                <InputField as="select" name="strategy" value={form.strategy} onChange={handleChange} disabled={form.type !== 'algorithm'}>
                  <option value="most_frequent">Most frequent</option>
                  <option value="least_frequent">Least frequent</option>
                </InputField>
              </div>
            </div>

            <div className="surface-muted rounded-xl p-4 text-sm text-slate-400">
              Current system default: <span className="font-semibold capitalize text-white">{drawConfigQuery.data?.type || 'random'}</span>
              {drawConfigQuery.data?.updatedAt ? ` · Updated ${new Date(drawConfigQuery.data.updatedAt).toLocaleString()}` : ''}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleUpdateConfig} disabled={isBusy || drawConfigQuery.isLoading}>
                {updateConfigMutation.isPending ? 'Saving...' : 'Save config'}
              </Button>
              <Button variant="secondary" type="button" onClick={() => handleAction('simulate')} disabled={isBusy}>
                {simulateMutation.isPending ? 'Simulating...' : 'Run simulation'}
              </Button>
              <Button variant="secondary" type="button" onClick={() => handleAction('create')} disabled={isBusy}>
                {createMutation.isPending ? 'Creating...' : 'Create draw'}
              </Button>
              <Button type="button" onClick={() => handleAction('run')} disabled={isBusy || !latestDraw || latestDraw.status === 'completed'}>
                {runMutation.isPending ? 'Running...' : 'Run draw'}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => handleAction('publish')}
                disabled={isBusy || !latestDraw || latestDraw.status !== 'completed' || Boolean(latestDraw.publishedAt)}
              >
                {publishMutation.isPending ? 'Publishing...' : 'Publish results'}
              </Button>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Current Snapshot" description="Review the most recent cycle and the latest simulation output before publishing.">
          {drawsQuery.isLoading ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16" />
            </div>
          ) : latestDraw ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={latestDraw.status} />
                <StatusBadge>{latestDraw.type}</StatusBadge>
                {latestDraw.publishedAt ? <StatusBadge>published</StatusBadge> : <StatusBadge status="pending">unpublished</StatusBadge>}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{latestDraw.month}/{latestDraw.year}</p>
                <p className="text-sm text-slate-400">Created {new Date(latestDraw.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(latestDraw.numbers || []).map((number) => (
                  <NumberBall key={number} value={number} highlighted />
                ))}
              </div>
            </div>
          ) : simulation ? (
            <div className="space-y-5">
              <StatusBadge>simulation</StatusBadge>
              <p className="text-sm text-slate-400">No live draw exists yet for the current cycle. Showing the latest simulation preview instead.</p>
              <div className="flex flex-wrap gap-2">
                {(simulation.draw?.numbers || []).map((number) => (
                  <NumberBall key={`simulation-preview-${number}`} value={number} highlighted />
                ))}
              </div>
              <div className="surface-muted rounded-xl p-4">
                <p className="text-sm font-semibold text-white">Simulation winners: {simulation.totalWinners}</p>
                <p className="mt-2 text-sm text-slate-400">Participants analysed: {simulation.totalParticipants}</p>
              </div>
            </div>
          ) : (
            <EmptyState title="No draw snapshot yet" description="Create a draw or run a simulation to preview the upcoming cycle." />
          )}

          {simulation ? (
            <div className="mt-6 surface-muted rounded-xl p-4">
              <p className="text-sm font-semibold text-white">Latest simulation winners: {simulation.totalWinners}</p>
              <p className="mt-2 text-sm text-slate-400">Participants analysed: {simulation.totalParticipants}</p>
            </div>
          ) : null}
        </DashboardCard>
      </div>

      <DashboardCard title="Draw History" description="A complete record of pending and completed monthly draw cycles.">
        {drawsQuery.isLoading && (
          <div className="space-y-3">
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
          </div>
        )}

        {drawsQuery.isError && <div className="py-10 text-center text-rose-300">{drawsQuery.error?.response?.data?.error || 'Unable to load draws'}</div>}

        {!drawsQuery.isLoading && !drawsQuery.isError && draws.length === 0 ? (
          <EmptyState title="No draws found" description="Once a monthly draw is created, the cycle history will appear here." />
        ) : null}

        {!drawsQuery.isLoading && !drawsQuery.isError && draws.length > 0 && (
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Numbers</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((draw) => (
                  <tr key={draw.id}>
                    <td>
                      <p className="font-semibold text-white">{draw.month}/{draw.year}</p>
                      <p className="text-slate-400">{new Date(draw.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td><StatusBadge>{draw.type}</StatusBadge></td>
                    <td><StatusBadge status={draw.status} /></td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {(draw.numbers || []).map((number) => (
                          <NumberBall key={`${draw.id}-${number}`} value={number} />
                        ))}
                      </div>
                    </td>
                    <td className="text-slate-400">{draw.publishedAt ? new Date(draw.publishedAt).toLocaleString() : 'Not published'}</td>
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
