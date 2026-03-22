import { useState } from "react";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { createCheckoutSession } from "../services/subscription";
import { getErrorMessage } from "../utils/getErrorMessage";

const plans = [
  {
    key: "monthly",
    name: "Monthly Plan",
    tagline: "Flexible access for active players",
    price: "$49",
    cadence: "/month",
    features: [
      "Stripe Checkout",
      "Premium score access",
      "Charity-backed membership",
    ],
  },
  {
    key: "yearly",
    name: "Yearly Plan",
    tagline: "Best value for committed supporters",
    price: "$499",
    cadence: "/year",
    features: [
      "Lower annual billing",
      "Priority member status",
      "Continuous premium access",
    ],
  },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  const handleSubscribe = async (plan) => {
    setError("");
    setLoadingPlan(plan);
    try {
      const response = await createCheckoutSession(plan);
      const checkoutUrl = response.data.data.url;
      window.location.href = checkoutUrl;
    } catch (checkoutError) {
      setError(getErrorMessage(checkoutError, "Unable to start checkout"));
      setLoadingPlan("");
    }
  };

  return (
    <section className="space-y-6">
      <div className="section-hero text-center">
        <StatusBadge>Pricing</StatusBadge>
        <h1 className="section-title mx-auto max-w-4xl">
          Choose the plan that matches your giving rhythm.
        </h1>
        <p className="section-copy mx-auto">
          Stripe handles payment securely. Your subscription becomes active only
          after webhook verification confirms payment.
        </p>
      </div>

      {error && (
        <div className="mx-auto max-w-2xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error.message || error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.key}
            className="surface-card p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(2,6,23,0.56)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {plan.tagline}
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {plan.name}
                </h2>
              </div>
              <StatusBadge>
                {plan.key === "yearly" ? "Best value" : "Flexible"}
              </StatusBadge>
            </div>
            <div className="mt-8 flex items-end gap-2">
              <span className="text-5xl font-semibold text-white">
                {plan.price}
              </span>
              <span className="pb-2 text-sm text-slate-500">
                {plan.cadence}
              </span>
            </div>
            <ul className="mt-8 space-y-3 text-sm text-slate-400">
              {plan.features.map((feature) => (
                <li key={feature} className="surface-muted px-4 py-3">
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              className="mt-8 w-full"
              onClick={() => handleSubscribe(plan.key)}
              disabled={loadingPlan === plan.key}
            >
              {loadingPlan === plan.key
                ? "Redirecting to Stripe..."
                : `Choose ${plan.name}`}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
