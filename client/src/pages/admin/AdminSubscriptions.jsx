import { useState } from "react";
import DashboardCard from "../../components/ui/DashboardCard";
import SkeletonBlock from "../../components/ui/SkeletonBlock";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  useAdminSubscriptions,
  useUpdateAdminSubscriptionStatus,
} from "../../hooks/useAdmin";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function AdminSubscriptions() {
  const [status, setStatus] = useState("");
  const subscriptionsQuery = useAdminSubscriptions({
    page: 1,
    limit: 20,
    status,
  });
  const updateStatusMutation = useUpdateAdminSubscriptionStatus();
  const [error, setError] = useState("");

  const subscriptions = subscriptionsQuery.data?.items || [];

  const handleStatusUpdate = async (subscriptionId, nextStatus) => {
    setError("");
    try {
      await updateStatusMutation.mutateAsync({
        subscriptionId,
        status: nextStatus,
      });
    } catch (mutationError) {
      setError(
        getErrorMessage(mutationError, "Unable to update subscription status"),
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-hero">
        <p className="section-label">Subscriptions</p>
        <h1 className="section-title">
          Audit live membership states and intervene manually.
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          {["", "active", "expired", "cancelled"].map((value) => (
            <button
              key={value || "all"}
              type="button"
              onClick={() => setStatus(value)}
              className={
                status === value
                  ? "app-button app-button-primary"
                  : "app-button app-button-secondary"
              }
            >
              {value || "All"}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <DashboardCard
        title="Subscription Directory"
        description="Review plan state, user linkage, and manually activate or deactivate records when needed."
      >
        {subscriptionsQuery.isLoading && (
          <div className="space-y-3">
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
          </div>
        )}
        {subscriptionsQuery.isError && (
          <div className="py-10 text-center text-rose-300">
            {getErrorMessage(
              subscriptionsQuery.error,
              "Unable to load subscriptions",
            )}
          </div>
        )}
        {!subscriptionsQuery.isLoading && !subscriptionsQuery.isError && (
          <div className="table-shell">
            <table>
              <thead>
                <tr className="text-slate-500">
                  <th className="font-semibold">Member</th>
                  <th className="font-semibold">Plan</th>
                  <th className="font-semibold">Status</th>
                  <th className="font-semibold">Amount</th>
                  <th className="font-semibold">Cycle</th>
                  <th className="font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="align-top text-slate-300"
                  >
                    <td>
                      <p className="font-semibold text-white">
                        {subscription.user?.name || "Unknown user"}
                      </p>
                      <p className="text-slate-500">
                        {subscription.user?.email}
                      </p>
                    </td>
                    <td className="capitalize">{subscription.plan}</td>
                    <td>
                      <StatusBadge status={subscription.status} />
                    </td>
                    <td>${Number(subscription.amount).toFixed(2)}</td>
                    <td className="text-slate-500">
                      {new Date(subscription.startDate).toLocaleDateString()} -{" "}
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(subscription.id, "active")
                          }
                          className="app-button app-button-primary"
                        >
                          Activate
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(subscription.id, "cancelled")
                          }
                          className="app-button app-button-secondary"
                        >
                          Cancel
                        </button>
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
