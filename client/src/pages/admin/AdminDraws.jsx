import { useState } from "react";
import Button from "../../components/ui/Button";
import DashboardCard from "../../components/ui/DashboardCard";
import SkeletonBlock from "../../components/ui/SkeletonBlock";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  useAdminDrawConfig,
  useAdminDraws,
  useCreateAdminDraw,
  usePublishAdminDraw,
  useRunAdminDraw,
  useSimulateAdminDraw,
  useUpdateAdminDrawConfig,
} from "../../hooks/useAdmin";

const DRAW_TYPES = ["random", "algorithm"];
const STRATEGIES = ["most_frequent", "least_frequent"];

export default function AdminDraws() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Form state for draw creation
  const [drawType, setDrawType] = useState("random");
  const [strategy, setStrategy] = useState("most_frequent");

  // Hooks
  const drawsQuery = useAdminDraws({ page: 1, limit: 20 });
  const drawConfigQuery = useAdminDrawConfig();
  const updateConfigMutation = useUpdateAdminDrawConfig();
  const createDrawMutation = useCreateAdminDraw();
  const simulateDrawMutation = useSimulateAdminDraw();
  const runDrawMutation = useRunAdminDraw();
  const publishDrawMutation = usePublishAdminDraw();

  const draws = drawsQuery.data?.items || [];
  const currentConfig = drawConfigQuery.data;

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleUpdateConfig = async (type) => {
    clearMessages();
    try {
      await updateConfigMutation.mutateAsync(type);
      setSuccessMessage(`Draw configuration updated to "${type}" mode.`);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to update draw configuration",
      );
    }
  };

  const handleCreateDraw = async () => {
    clearMessages();
    setSimulationResult(null);
    try {
      await createDrawMutation.mutateAsync({ type: drawType, strategy });
      setSuccessMessage("Draw created successfully for the current month.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create draw");
    }
  };

  const handleSimulate = async () => {
    clearMessages();
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const response = await simulateDrawMutation.mutateAsync({
        type: drawType,
        strategy,
      });
      setSimulationResult(response.data.data);
      setSuccessMessage(
        "Simulation complete. Results shown below — no data was saved.",
      );
    } catch (err) {
      setError(err.response?.data?.error || "Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunDraw = async () => {
    clearMessages();
    try {
      await runDrawMutation.mutateAsync();
      setSuccessMessage(
        "Draw executed successfully. Winners have been recorded.",
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to run draw");
    }
  };

  const handlePublishDraw = async () => {
    clearMessages();
    try {
      await publishDrawMutation.mutateAsync();
      setSuccessMessage(
        "Draw results published. Members can now view their results.",
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish draw");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="section-hero">
        <p className="section-label">Draw Management</p>
        <h1 className="section-title">
          Configure, simulate, run, and publish monthly draws.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          Each month one draw runs against all active subscriber scores. Use
          simulation to preview outcomes before committing. Publishing makes
          results visible to members.
        </p>
      </section>

      {/* Feedback messages */}
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

      {/* Draw Configuration */}
      <DashboardCard
        title="Draw Configuration"
        description="Set the global draw type. This applies to all future draws unless overridden at creation time."
      >
        {drawConfigQuery.isLoading ? (
          <SkeletonBlock className="h-16" />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-400">
              Current mode:{" "}
              <span className="font-semibold capitalize text-white">
                {currentConfig?.type || "random"}
              </span>
            </span>
            <div className="flex gap-2">
              {DRAW_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={
                    currentConfig?.type === type ? "primary" : "secondary"
                  }
                  onClick={() => handleUpdateConfig(type)}
                  disabled={updateConfigMutation.isPending}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Create & Simulate */}
      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardCard
          title="Draw Parameters"
          description="Set the draw type and algorithm strategy, then create or simulate."
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-400">
                Draw Type
              </p>
              <div className="flex gap-2">
                {DRAW_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDrawType(type)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      drawType === type
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {drawType === "algorithm" && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-400">
                  Algorithm Strategy
                </p>
                <div className="flex gap-2">
                  {STRATEGIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStrategy(s)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
                        strategy === s
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="button"
                onClick={handleSimulate}
                variant="secondary"
                disabled={isSimulating || simulateDrawMutation.isPending}
              >
                {isSimulating ? "Simulating..." : "Run Simulation"}
              </Button>
              <Button
                type="button"
                onClick={handleCreateDraw}
                disabled={createDrawMutation.isPending}
              >
                {createDrawMutation.isPending
                  ? "Creating..."
                  : "Create This Month's Draw"}
              </Button>
            </div>
          </div>
        </DashboardCard>

        {/* Run & Publish Controls */}
        <DashboardCard
          title="Execution Controls"
          description="Run the current month's draw against all subscriber scores, then publish results to members."
        >
          <div className="space-y-4">
            <div className="surface-muted rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                Important Order
              </p>
              <ol className="mt-3 space-y-2 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-400">1.</span>
                  Create draw for this month (sets numbers)
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-400">2.</span>
                  Optionally simulate to preview winners
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-400">3.</span>
                  Run draw — evaluates all scores, records winners
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-400">4.</span>
                  Publish — members can now view results
                </li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleRunDraw}
                disabled={runDrawMutation.isPending}
              >
                {runDrawMutation.isPending
                  ? "Running Draw..."
                  : "Run Current Draw"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePublishDraw}
                disabled={publishDrawMutation.isPending}
              >
                {publishDrawMutation.isPending
                  ? "Publishing..."
                  : "Publish Results"}
              </Button>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <DashboardCard
          title="Simulation Results"
          description="These are preview results only. No data was saved to the database."
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="surface-muted rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Draw Numbers
                </p>
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Total Participants
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {simulationResult.totalParticipants}
                </p>
              </div>
              <div className="surface-muted rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Predicted Winners
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {simulationResult.totalWinners}
                </p>
              </div>
            </div>

            {/* Match Distribution */}
            {simulationResult.matchDistribution && (
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-400">
                  Match Distribution
                </p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(simulationResult.matchDistribution).map(
                    ([matches, count]) => (
                      <div
                        key={matches}
                        className="surface-muted rounded-xl px-4 py-3 text-center"
                      >
                        <p className="text-xs text-slate-500">
                          {matches} matches
                        </p>
                        <p className="mt-1 text-xl font-semibold text-white">
                          {count}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Predicted winners table */}
            {simulationResult.predictedWinners?.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-400">
                  Predicted Winners
                </p>
                <div className="table-shell">
                  <table>
                    <thead>
                      <tr className="text-slate-500">
                        <th className="font-semibold">Member</th>
                        <th className="font-semibold">Matches</th>
                        <th className="font-semibold">Matched Numbers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResult.predictedWinners.map((winner, idx) => (
                        <tr key={idx} className="text-slate-300">
                          <td>
                            <p className="font-semibold text-white">
                              {winner.user?.name || "Unknown"}
                            </p>
                            <p className="text-slate-500">
                              {winner.user?.email}
                            </p>
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
                No predicted winners with these draw numbers. The jackpot would
                roll over to next month.
              </div>
            )}
          </div>
        </DashboardCard>
      )}

      {/* Draw History */}
      <DashboardCard
        title="Draw History"
        description="All draws recorded in the system, ordered most recent first."
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
            {drawsQuery.error?.response?.data?.error || "Unable to load draws"}
          </div>
        )}
        {!drawsQuery.isLoading && !drawsQuery.isError && draws.length === 0 && (
          <div className="surface-muted rounded-xl px-4 py-10 text-center text-sm text-slate-400">
            No draws created yet. Use the controls above to create the first
            draw.
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
                  <tr key={draw.id} className="align-top text-slate-300">
                    <td className="font-semibold text-white">
                      {draw.month}/{draw.year}
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
                      {draw.publishedAt
                        ? new Date(draw.publishedAt).toLocaleDateString()
                        : "—"}
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
