import { getErrorMessage } from "../../utils/getErrorMessage";
import { useState } from "react";
import Button from "../../components/ui/Button";
import DashboardCard from "../../components/ui/DashboardCard";
import SkeletonBlock from "../../components/ui/SkeletonBlock";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  useAdminDraws,
  useAdminPrizePool,
  useAdminWinnings,
  useDistributeAdminPrizes,
  usePayAdminWinning,
  useRejectAdminWinning,
  useVerifyAdminWinning,
} from "../../hooks/useAdmin";

export default function AdminWinnings() {
  const drawsQuery = useAdminDraws({ page: 1, limit: 12 });
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const latestDrawId = drawsQuery.data?.items?.[0]?.id;
  const winningsQuery = useAdminWinnings({ status: statusFilter || undefined });
  const prizePoolQuery = useAdminPrizePool(latestDrawId);
  const distributeMutation = useDistributeAdminPrizes();
  const verifyMutation = useVerifyAdminWinning();
  const rejectMutation = useRejectAdminWinning();
  const payMutation = usePayAdminWinning();

  const winnings = winningsQuery.data || [];
  const latestDraw = drawsQuery.data?.items?.[0] || null;

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleDistribute = async () => {
    if (!latestDrawId) return;
    clearMessages();
    try {
      await distributeMutation.mutateAsync(latestDrawId);
      setSuccessMessage(
        "Prize pool distributed successfully across all tiers.",
      );
    } catch (distributionError) {
      setError(
        distributionError.response?.data?.error ||
          "Unable to distribute prizes",
      );
    }
  };

  const handleVerify = async (winningId) => {
    clearMessages();
    try {
      await verifyMutation.mutateAsync(winningId);
      setSuccessMessage("Winning verified successfully.");
    } catch (verificationError) {
      setError(
        verificationError.response?.data?.error || "Unable to verify winning",
      );
    }
  };

  const handleReject = async (winningId) => {
    clearMessages();
    try {
      await rejectMutation.mutateAsync(winningId);
      setSuccessMessage(
        "Winning rejected. The member will be notified to re-upload proof.",
      );
    } catch (rejectionError) {
      setError(
        rejectionError.response?.data?.error || "Unable to reject winning",
      );
    }
  };

  const handlePay = async (winningId) => {
    clearMessages();
    try {
      await payMutation.mutateAsync(winningId);
      setSuccessMessage("Winning marked as paid.");
    } catch (paymentError) {
      setError(
        paymentError.response?.data?.error || "Unable to mark winning as paid",
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-hero">
        <p className="section-label">Winnings management</p>
        <h1 className="section-title">
          Review proofs, distribute prize pools, and finalize payouts with a
          clear status trail.
        </h1>
      </section>

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Latest Draw"
          value={
            latestDraw ? `${latestDraw.month}/${latestDraw.year}` : "No draw"
          }
          description="Distribution targets the latest cycle by default."
        />
        <DashboardCard
          title="Current Prize Pool"
          value={
            prizePoolQuery.data
              ? `$${Number(prizePoolQuery.data.totalPoolAmount).toFixed(2)}`
              : "$0.00"
          }
          description="Computed from subscription revenue and carry-forward rules."
        />
        <DashboardCard
          title="Current Winners"
          value={String(
            winnings.filter((w) => w.draw?.id === latestDrawId).length,
          )}
          description="Winnings currently linked to the latest draw."
        >
          <Button
            type="button"
            onClick={handleDistribute}
            disabled={!latestDrawId || distributeMutation.isPending}
          >
            {distributeMutation.isPending
              ? "Distributing..."
              : "Run distribution"}
          </Button>
        </DashboardCard>
      </div>

      {/* Status Filter */}
      <DashboardCard
        title="Filter Winnings"
        description="Filter by payout state for quick operational review."
      >
        <div className="flex flex-wrap gap-3">
          {["", "pending", "verified", "paid", "rejected"].map((value) => (
            <Button
              key={value || "all"}
              variant={statusFilter === value ? "primary" : "secondary"}
              type="button"
              onClick={() => setStatusFilter(value)}
            >
              {value || "All"}
            </Button>
          ))}
        </div>
      </DashboardCard>

      {/* Winnings Table */}
      <DashboardCard
        title="Winnings Queue"
        description="Pending proofs must be verified before payout. Rejected proofs require the member to re-upload. Paid records are final."
      >
        {winningsQuery.isLoading && (
          <div className="space-y-3">
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
          </div>
        )}

        {winningsQuery.isError && (
          <div className="py-10 text-center text-rose-300">
            {getErrorMessage(winningsQuery.error, "Unable to load winnings")}
          </div>
        )}

        {!winningsQuery.isLoading &&
          !winningsQuery.isError &&
          winnings.length === 0 && (
            <div className="surface-muted rounded-xl px-4 py-10 text-center text-sm text-slate-400">
              No winnings match the current filter.
            </div>
          )}

        {!winningsQuery.isLoading &&
          !winningsQuery.isError &&
          winnings.length > 0 && (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Winner</th>
                    <th>Draw</th>
                    <th>Tier</th>
                    <th>Prize</th>
                    <th>Status</th>
                    <th>Proof</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {winnings.map((winning) => (
                    <tr key={winning.id}>
                      <td>
                        <p className="font-semibold text-white">
                          {winning.user?.name || "Unknown user"}
                        </p>
                        <p className="text-slate-400">
                          {winning.user?.email || "No email"}
                        </p>
                      </td>
                      <td className="text-slate-300">
                        {winning.draw
                          ? `${winning.draw.month}/${winning.draw.year}`
                          : "Unknown"}
                      </td>
                      <td>
                        <StatusBadge>{`${winning.matchCount} matches`}</StatusBadge>
                      </td>
                      <td className="font-semibold text-white">
                        ${Number(winning.prizeAmount || 0).toFixed(2)}
                      </td>
                      <td>
                        <StatusBadge status={winning.status} />
                      </td>
                      <td>
                        {winning.proofImage ? (
                          <a
                            href={winning.proofImage}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-indigo-300 hover:text-indigo-200"
                          >
                            View proof
                          </a>
                        ) : (
                          <span className="text-slate-500">Not uploaded</span>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {/* Verify — only for pending with proof uploaded */}
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => handleVerify(winning.id)}
                            disabled={
                              !winning.proofImage ||
                              winning.status !== "pending" ||
                              verifyMutation.isPending
                            }
                          >
                            Verify
                          </Button>

                          {/* Reject — for pending or verified (before paid) */}
                          <Button
                            variant="danger"
                            type="button"
                            onClick={() => handleReject(winning.id)}
                            disabled={
                              winning.status === "paid" ||
                              winning.status === "rejected" ||
                              rejectMutation.isPending
                            }
                          >
                            Reject
                          </Button>

                          {/* Mark paid — only for verified */}
                          <Button
                            type="button"
                            onClick={() => handlePay(winning.id)}
                            disabled={
                              winning.status !== "verified" ||
                              payMutation.isPending
                            }
                          >
                            Mark paid
                          </Button>
                        </div>
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
