import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getCurrentSubscription } from "../services/subscription";
import { getErrorMessage } from "../utils/getErrorMessage";

const MAX_ATTEMPTS = 6;
const RETRY_DELAY_MS = 2000;

function wait(delay) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export default function Success() {
  const queryClient = useQueryClient();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );

    const loadSubscription = async () => {
      try {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
          const response = await getCurrentSubscription(sessionId);
          const nextSubscription = response.data.data;
          if (nextSubscription) {
            if (!isMounted) return;
            setSubscription(nextSubscription);
            setError("");
            queryClient.setQueryData(["subscription"], nextSubscription);
            await queryClient.invalidateQueries({ queryKey: ["subscription"] });
            return;
          }
          if (attempt < MAX_ATTEMPTS) await wait(RETRY_DELAY_MS);
        }
        if (isMounted)
          setError(
            "Your subscription is still being activated. Please refresh in a moment.",
          );
      } catch (requestError) {
        if (isMounted)
          setError(
            getErrorMessage(
              requestError,
              "Subscription is still being confirmed",
            ),
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSubscription();
    return () => {
      isMounted = false;
    };
  }, [queryClient]);

  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/40 bg-white/85 p-8 shadow-[0_24px_80px_rgba(20,57,44,0.16)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
        Payment success
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900">
        Thanks for subscribing.
      </h1>
      <p className="mt-3 text-stone-600">
        Your access becomes available only after the verified Stripe webhook
        updates the database.
      </p>

      <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6">
        {loading && (
          <p className="text-stone-600">Checking subscription status...</p>
        )}
        {!loading && subscription && (
          <div className="space-y-2 text-stone-700">
            <p>
              <strong>Status:</strong> {subscription.status}
            </p>
            <p>
              <strong>Plan:</strong> {subscription.plan}
            </p>
            <p>
              <strong>Ends:</strong>{" "}
              {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
        {!loading && !subscription && (
          <p className="text-stone-600">
            {error ||
              "Your subscription is still being activated. Refresh in a moment."}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Open dashboard
        </Link>
        <Link
          to="/pricing"
          className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-900"
        >
          View pricing
        </Link>
      </div>
    </section>
  );
}
