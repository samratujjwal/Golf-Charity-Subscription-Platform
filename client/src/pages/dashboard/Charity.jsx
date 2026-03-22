import { useState } from "react";
import DashboardCard from "../../components/ui/DashboardCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import {
  useCharities,
  useMakeDonation,
  useMyDonations,
  useSelectCharity,
  useUpdateCharityPercentage,
} from "../../hooks/useCharities";
import { useSubscription } from "../../hooks/useSubscription";
import { useUser } from "../../hooks/useUser";

export default function DashboardCharity() {
  const { refetchUser } = useAuth();
  const userQuery = useUser();
  const subscriptionQuery = useSubscription();

  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const charitiesQuery = useCharities({
    search: search || undefined,
    featured: featuredOnly ? "true" : undefined,
  });

  const selectCharityMutation = useSelectCharity();
  const updatePercentageMutation = useUpdateCharityPercentage();
  const makeDonationMutation = useMakeDonation();
  const donationsQuery = useMyDonations();

  const [charityError, setCharityError] = useState("");
  const [percentageError, setPercentageError] = useState("");
  const [percentageSuccess, setPercentageSuccess] = useState("");
  const [donationError, setDonationError] = useState("");
  const [donationSuccess, setDonationSuccess] = useState("");

  // Percentage editor state — seeded from subscription
  const currentPercentage = subscriptionQuery.data?.charityPercentage ?? 10;
  const [newPercentage, setNewPercentage] = useState("");

  // Donation form
  const [donationCharityId, setDonationCharityId] = useState("");
  const [donationAmount, setDonationAmount] = useState("");

  const user = userQuery.data;
  const charities = charitiesQuery.data || [];
  const donations = donationsQuery.data || [];
  const selectedCharity =
    charities.find((c) => c._id === user?.charityId) || null;
  const hasActiveSubscription = subscriptionQuery.data?.status === "active";

  /* ── Handlers ── */

  const handleSelectCharity = async (charityId) => {
    setCharityError("");
    try {
      await selectCharityMutation.mutateAsync(charityId);
      await refetchUser();
    } catch (err) {
      setCharityError(err.response?.data?.error || "Unable to select charity");
    }
  };

  const handleUpdatePercentage = async (e) => {
    e.preventDefault();
    setPercentageError("");
    setPercentageSuccess("");
    const val = Number(newPercentage);
    if (!val || val < 10 || val > 100) {
      setPercentageError("Percentage must be between 10 and 100.");
      return;
    }
    try {
      await updatePercentageMutation.mutateAsync(val);
      setPercentageSuccess(`Charity contribution updated to ${val}%.`);
      setNewPercentage("");
    } catch (err) {
      setPercentageError(
        err.response?.data?.error || "Unable to update percentage",
      );
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setDonationError("");
    setDonationSuccess("");
    const amount = Number(donationAmount);
    if (!donationCharityId) {
      setDonationError("Please select a charity to donate to.");
      return;
    }
    if (!amount || amount <= 0) {
      setDonationError("Please enter a valid donation amount.");
      return;
    }
    try {
      const result = await makeDonationMutation.mutateAsync({
        charityId: donationCharityId,
        amount,
      });
      setDonationSuccess(result.message || "Donation recorded successfully!");
      setDonationAmount("");
      setDonationCharityId("");
    } catch (err) {
      setDonationError(err.response?.data?.error || "Donation failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.14),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(254,242,242,0.88))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Charity
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Choose where your membership gives back.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Every subscription supports a cause. Pick the organisation that
          matters most to you, adjust how much of your subscription goes to
          charity, and make one-time donations whenever you like.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Current Selection */}
          <DashboardCard
            title="Your Selected Charity"
            description="This charity receives the contribution linked to your active subscription."
          >
            {userQuery.isLoading ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : selectedCharity ? (
              <div className="space-y-3 rounded-[1.5rem] border border-rose-100 bg-rose-50/80 p-5">
                <StatusBadge>
                  {selectedCharity.isFeatured ? "featured" : "selected"}
                </StatusBadge>
                <h3 className="text-2xl font-semibold text-slate-950">
                  {selectedCharity.name}
                </h3>
                <p className="text-sm leading-7 text-slate-600">
                  {selectedCharity.description}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  Total impact so far:{" "}
                  <span className="text-emerald-700">
                    $
                    {Number(
                      selectedCharity.totalDonations || 0,
                    ).toLocaleString()}
                  </span>
                </p>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-600">
                You have not selected a charity yet. Choose one from the list.
              </div>
            )}
            {charityError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {charityError}
              </div>
            )}
          </DashboardCard>

          {/* Contribution Percentage — PRD §08 */}
          <DashboardCard
            title="Contribution Percentage"
            description={
              hasActiveSubscription
                ? `Currently ${currentPercentage}% of your subscription goes to charity. Minimum is 10%, maximum is 100%.`
                : "An active subscription is required to adjust your charity percentage."
            }
          >
            {hasActiveSubscription ? (
              <form className="space-y-4" onSubmit={handleUpdatePercentage}>
                {/* Visual slider */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">10%</span>
                    <span className="font-bold text-white">
                      {newPercentage || currentPercentage}%
                    </span>
                    <span className="text-slate-500">100%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={newPercentage || currentPercentage}
                    onChange={(e) => setNewPercentage(e.target.value)}
                    className="w-full accent-indigo-500"
                  />
                  <div className="mt-2 flex gap-2">
                    {[10, 20, 25, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setNewPercentage(String(pct))}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                          Number(newPercentage || currentPercentage) === pct
                            ? "bg-indigo-500 text-white"
                            : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {percentageError && (
                  <p className="text-sm text-rose-400">{percentageError}</p>
                )}
                {percentageSuccess && (
                  <p className="text-sm text-emerald-400">
                    {percentageSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    updatePercentageMutation.isPending ||
                    !newPercentage ||
                    Number(newPercentage) === currentPercentage
                  }
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatePercentageMutation.isPending
                    ? "Saving…"
                    : "Save percentage"}
                </button>
              </form>
            ) : (
              <p className="text-sm text-slate-500">
                Subscribe to a plan first to unlock percentage customisation.
              </p>
            )}
          </DashboardCard>

          {/* Independent Donation — PRD §08 */}
          <DashboardCard
            title="Make a Direct Donation"
            description="One-time donation — independent of your subscription. Every pound counts."
          >
            <form className="space-y-4" onSubmit={handleDonate}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Choose charity
                </span>
                <select
                  value={donationCharityId}
                  onChange={(e) => setDonationCharityId(e.target.value)}
                  className="app-select"
                  required
                >
                  <option value="">Select a charity…</option>
                  {charities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Amount ($)
                </span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="e.g. 25"
                  required
                  className="app-input"
                />
              </label>

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-2">
                {[5, 10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(String(amt))}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      Number(donationAmount) === amt
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {donationError && (
                <p className="text-sm text-rose-400">{donationError}</p>
              )}
              {donationSuccess && (
                <p className="text-sm text-emerald-400">{donationSuccess}</p>
              )}

              <button
                type="submit"
                disabled={makeDonationMutation.isPending}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.36)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {makeDonationMutation.isPending ? "Processing…" : "Donate now"}
              </button>
            </form>
          </DashboardCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Browse Charities */}
          <DashboardCard
            title="Browse Charities"
            description="Search by name or focus only on featured causes."
          >
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-950"
                  placeholder="Search charities by name"
                />
              </label>
              <label className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Featured only
              </label>
            </div>
          </DashboardCard>

          {/* Charity cards */}
          {charitiesQuery.isLoading && (
            <div className="flex min-h-48 items-center justify-center rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
            </div>
          )}

          {charitiesQuery.isError && (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              {charitiesQuery.error?.response?.data?.error ||
                "Unable to load charities."}
            </div>
          )}

          {!charitiesQuery.isLoading &&
            !charitiesQuery.isError &&
            charities.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600 backdrop-blur">
                No charities matched your current search.
              </div>
            )}

          {!charitiesQuery.isLoading &&
            !charitiesQuery.isError &&
            charities.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {charities.map((charity) => {
                  const isSelected = charity._id === user?.charityId;
                  return (
                    <article
                      key={charity._id}
                      className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur"
                    >
                      <div className="h-44 bg-[linear-gradient(135deg,#fdf2f8,#e0f2fe)]">
                        {charity.image ? (
                          <img
                            src={charity.image}
                            alt={charity.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Charity image
                          </div>
                        )}
                      </div>
                      <div className="space-y-3 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                            {charity.name}
                          </h3>
                          {charity.isFeatured && (
                            <StatusBadge>featured</StatusBadge>
                          )}
                        </div>
                        <p className="text-sm leading-7 text-slate-600">
                          {charity.description || "More details coming soon."}
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          Raised:{" "}
                          <span className="text-emerald-700">
                            $
                            {Number(
                              charity.totalDonations || 0,
                            ).toLocaleString()}
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectCharity(charity._id)}
                            disabled={selectCharityMutation.isPending}
                            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                              isSelected
                                ? "bg-slate-950 text-white"
                                : "border border-slate-300 text-slate-700 hover:border-slate-950 hover:text-slate-950"
                            }`}
                          >
                            {isSelected ? "✓ Selected" : "Select charity"}
                          </button>
                          {/* Quick donate shortcut */}
                          <button
                            type="button"
                            onClick={() => {
                              setDonationCharityId(charity._id);
                              document
                                .querySelector("[data-donate-form]")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                          >
                            Donate
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          {/* Donation History */}
          <DashboardCard
            title="Your Donation History"
            description="All direct donations you have made to charities on this platform."
          >
            {donationsQuery.isLoading && (
              <p className="text-sm text-slate-400">Loading donations…</p>
            )}
            {!donationsQuery.isLoading && donations.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-slate-700 bg-slate-900/40 px-4 py-8 text-center text-sm text-slate-400">
                You have not made any direct donations yet.
              </div>
            )}
            {!donationsQuery.isLoading && donations.length > 0 && (
              <div className="space-y-3">
                {donations.map((donation, idx) => (
                  <div
                    key={donation.id || idx}
                    className="surface-muted flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {donation.charityId?.name || "Unknown charity"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-emerald-400">
                      +${Number(donation.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
