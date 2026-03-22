import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { healthApi } from "../services/api";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Subscribe",
    body: "Pick a monthly or yearly plan. Part of every payment flows directly to a charity of your choice — automatically, every cycle.",
    accent: "from-indigo-500 to-purple-500",
  },
  {
    step: "02",
    title: "Enter your scores",
    body: "Log your last five Stableford rounds (values 1–45). Your most recent scores are always what count — the system keeps only your latest five.",
    accent: "from-sky-500 to-indigo-500",
  },
  {
    step: "03",
    title: "Win every month",
    body: "Each month five numbers are drawn. Match 3, 4, or 5 and you win a share of the prize pool. The jackpot rolls over if nobody hits all five.",
    accent: "from-purple-500 to-pink-500",
  },
  {
    step: "04",
    title: "Make an impact",
    body: "Winners upload a score screenshot for verification. Once approved, payouts are processed. Charity donations happen automatically on every renewal.",
    accent: "from-emerald-500 to-sky-500",
  },
];

const PRIZE_TIERS = [
  { matches: 5, share: "40%", label: "Jackpot", rollover: true },
  { matches: 4, share: "35%", label: "4-Number Match", rollover: false },
  { matches: 3, share: "25%", label: "3-Number Match", rollover: false },
];

const FEATURES = [
  {
    icon: "⛳",
    title: "Stableford scoring",
    body: "Standard golf scoring format, 1–45 per round. Submit up to five. The oldest auto-drops when you add a sixth.",
  },
  {
    icon: "🎯",
    title: "Algorithm or random draws",
    body: "Admins can run a fully random draw or an algorithm weighted by the most (or least) frequent scores across all players.",
  },
  {
    icon: "🏆",
    title: "Tiered prize pool",
    body: "50% of every subscription goes into the prize pool. Winners split their tier share equally. Jackpot rolls forward when unclaimed.",
  },
  {
    icon: "❤️",
    title: "Charity-first design",
    body: "Choose any listed charity. At least 10% of your plan value goes there every cycle. Raise it to 100% if you want.",
  },
  {
    icon: "🔒",
    title: "Verified payouts",
    body: "Winners upload a screenshot of their score card. Admins verify before any payout is released.",
  },
  {
    icon: "📊",
    title: "Full admin controls",
    body: "Manage users, configure draws, run simulations, distribute prizes, and track charity contributions — all from one dashboard.",
  },
];

const initialState = { loading: true, message: "", error: null };

export default function Home() {
  const [state, setState] = useState(initialState);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const response = await healthApi.getStatus();
        if (!isMounted) return;
        const health = response.data.data;
        setState({
          loading: false,
          message:
            health?.status === "ok"
              ? "API is running"
              : "API status unavailable",
          error: null,
        });
      } catch (error) {
        if (!isMounted) return;
        setState({
          loading: false,
          message: "",
          error:
            error.response?.data?.error ||
            error.message ||
            "Unable to reach the API",
        });
      }
    };
    fetchHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="section-hero overflow-hidden">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <StatusBadge>Golf · Charity · Rewards</StatusBadge>

            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
              Play golf.{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Win prizes.
              </span>
              <br />
              Give back.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
              Subscribe, enter your Stableford scores, and compete in monthly
              draws. Part of every subscription goes straight to a charity you
              choose — every single month.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <span className="app-button app-button-primary">
                      Start for free
                    </span>
                  </Link>
                  <Link to="/login">
                    <span className="app-button app-button-secondary">
                      Sign in
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/pricing">
                    <span className="app-button app-button-primary">
                      View plans
                    </span>
                  </Link>
                  <Link to="/dashboard">
                    <span className="app-button app-button-secondary">
                      Open {user?.name?.split(" ")[0] || "your"}'s dashboard
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick stats */}
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { label: "Prize pool share", value: "50%" },
                { label: "Min. charity cut", value: "10%" },
                { label: "Jackpot rollover", value: "Yes" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: API status + prize tier preview */}
          <div className="space-y-4">
            <div className="surface-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Platform status
              </p>
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-500">Health check</p>
                <div className="mt-3 min-h-8 text-2xl font-semibold text-white">
                  {state.loading && "Checking…"}
                  {!state.loading && !state.error && state.message}
                  {!state.loading && state.error && "Connection failed"}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {state.error ||
                    "Frontend is successfully communicating with the backend API."}
                </p>
              </div>
            </div>

            {/* Prize tier card */}
            <div className="surface-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Prize pool tiers
              </p>
              <div className="mt-4 space-y-3">
                {PRIZE_TIERS.map((tier) => (
                  <div
                    key={tier.matches}
                    className="surface-muted flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
                        {tier.matches}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {tier.label}
                        </p>
                        {tier.rollover && (
                          <p className="text-xs text-amber-400">
                            Rolls over if unclaimed
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xl font-bold text-indigo-300">
                      {tier.share}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section>
        <div className="mb-8 text-center">
          <p className="section-label">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Four simple steps
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="surface-card surface-glow p-6">
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-sm font-bold text-white shadow-lg`}
              >
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CHARITY IMPACT ───────────────────────────────────── */}
      <section className="surface-card overflow-hidden p-8">
        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <p className="section-label">Charity impact</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Every subscription gives back.
            </h2>
            <p className="mt-4 text-sm leading-8 text-slate-400">
              When you subscribe, you pick a charity from our curated directory.
              At least 10% of every payment goes directly to that cause — and
              you can raise it all the way to 100%. You can also make one-off
              direct donations at any time, no subscription required.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                "10–100% of your subscription allocated to charity",
                "Charity selection before first payment",
                "Independent one-time donations always available",
                "Contributions tracked transparently on each charity profile",
              ].map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <span className="mt-0.5 text-emerald-400">✓</span>
                  {point}
                </div>
              ))}
            </div>
            {!isAuthenticated && (
              <div className="mt-8">
                <Link to="/register">
                  <span className="app-button app-button-primary">
                    Create an account
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Charity contribution example */}
          <div className="space-y-4">
            <div className="surface-muted rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
                Example — Monthly plan at $49
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { pct: 10, label: "Minimum (default)" },
                  { pct: 25, label: "Generous" },
                  { pct: 50, label: "Half-and-half" },
                  { pct: 100, label: "Full donation" },
                ].map(({ pct, label }) => (
                  <div key={pct} className="flex items-center gap-3 text-sm">
                    <div className="w-24 shrink-0">
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-10 font-bold text-white">{pct}%</span>
                    <span className="text-slate-400">
                      ${((49 * pct) / 100).toFixed(2)} → charity
                    </span>
                    <span className="text-slate-600">({label})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ────────────────────────────────────── */}
      <section>
        <div className="mb-8 text-center">
          <p className="section-label">Platform features</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Everything you need
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="surface-card p-6 transition-all duration-200 hover:-translate-y-1"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA FOOTER ───────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="section-hero text-center">
          <p className="section-label">Ready to play?</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Join today. Play next month.
          </h2>
          <p className="section-copy mx-auto mt-4">
            Create your account, pick a charity, choose a plan, and submit your
            first five scores. You'll be entered into the next monthly draw
            automatically.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <span className="app-button app-button-primary">
                Create your account
              </span>
            </Link>
            <Link to="/login">
              <span className="app-button app-button-secondary">Sign in</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
