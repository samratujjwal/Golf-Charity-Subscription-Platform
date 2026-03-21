import { useState } from 'react';
import DashboardCard from '../../components/ui/DashboardCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useCharities, useSelectCharity } from '../../hooks/useCharities';
import { useUser } from '../../hooks/useUser';

export default function DashboardCharity() {
  const { refetchUser } = useAuth();
  const userQuery = useUser();
  const [search, setSearch] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const charitiesQuery = useCharities({
    search: search || undefined,
    featured: featuredOnly ? 'true' : undefined,
  });
  const selectCharityMutation = useSelectCharity();
  const [error, setError] = useState('');

  const user = userQuery.data;
  const charities = charitiesQuery.data || [];
  const selectedCharity = charities.find((charity) => charity._id === user?.charityId) || null;

  const handleSelect = async (charityId) => {
    setError('');

    try {
      await selectCharityMutation.mutateAsync(charityId);
      await refetchUser();
    } catch (selectionError) {
      setError(selectionError.response?.data?.error || 'Unable to select charity');
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.14),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(254,242,242,0.88))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Charity</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Choose where your membership gives back.</h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Every subscription supports a cause. Pick the organization that matters most to you, and the backend will attribute a portion of your subscription automatically.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <DashboardCard title="Your Selected Charity" description="This charity receives the contribution linked to successful subscription payments.">
          {userQuery.isLoading && <p className="text-slate-600">Loading your selection...</p>}
          {!userQuery.isLoading && selectedCharity && (
            <div className="space-y-3 rounded-[1.5rem] border border-rose-100 bg-rose-50/80 p-5">
              <StatusBadge>{selectedCharity.isFeatured ? 'featured' : 'selected'}</StatusBadge>
              <h3 className="text-2xl font-semibold text-slate-950">{selectedCharity.name}</h3>
              <p className="text-sm leading-7 text-slate-600">{selectedCharity.description}</p>
              <p className="text-sm font-semibold text-slate-700">
                Total impact so far: ${Number(selectedCharity.totalDonations || 0).toLocaleString()}
              </p>
            </div>
          )}
          {!userQuery.isLoading && !selectedCharity && (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-600">
              You have not selected a charity yet. Choose one below before starting or renewing a subscription.
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </DashboardCard>

        <div className="space-y-4">
          <DashboardCard title="Browse Charities" description="Search by name or focus only on featured causes.">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-950"
                  placeholder="Search charities by name"
                />
              </label>

              <label className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(event) => setFeaturedOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Featured only
              </label>
            </div>
          </DashboardCard>

          {charitiesQuery.isLoading && (
            <div className="flex min-h-48 items-center justify-center rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
            </div>
          )}

          {charitiesQuery.isError && (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-[0_20px_70px_rgba(244,63,94,0.12)]">
              {charitiesQuery.error?.response?.data?.error || 'Unable to load charities.'}
            </div>
          )}

          {!charitiesQuery.isLoading && !charitiesQuery.isError && charities.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600 shadow-[0_20px_70px_rgba(15,23,42,0.05)] backdrop-blur">
              No charities matched your current search.
            </div>
          )}

          {!charitiesQuery.isLoading && !charitiesQuery.isError && charities.length > 0 && (
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
                        <img src={charity.image} alt={charity.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Charity image
                        </div>
                      )}
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{charity.name}</h3>
                        {charity.isFeatured && <StatusBadge>featured</StatusBadge>}
                      </div>
                      <p className="text-sm leading-7 text-slate-600">{charity.description || 'More details coming soon for this organization.'}</p>
                      <p className="text-sm font-semibold text-slate-700">
                        Raised through platform: ${Number(charity.totalDonations || 0).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSelect(charity._id)}
                        disabled={selectCharityMutation.isPending && isSelected}
                        className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition ${
                          isSelected
                            ? 'bg-slate-950 text-white'
                            : 'border border-slate-300 text-slate-700 hover:border-slate-950 hover:text-slate-950'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Charity'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
