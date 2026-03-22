import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import DashboardCard from "../../components/ui/DashboardCard";
import EmptyState from "../../components/ui/EmptyState";
import InputField from "../../components/ui/InputField";
import SkeletonBlock from "../../components/ui/SkeletonBlock";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  useAdminCharities,
  useCreateAdminCharity,
  useDeleteAdminCharity,
  useUpdateAdminCharity,
} from "../../hooks/useAdmin";
import { getErrorMessage } from "../../utils/getErrorMessage";

const initialForm = { name: "", description: "", image: "", isFeatured: false };

export default function AdminCharities() {
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const charitiesQuery = useAdminCharities({
    search: search || undefined,
    featured: featuredOnly ? "true" : undefined,
  });
  const createMutation = useCreateAdminCharity();
  const updateMutation = useUpdateAdminCharity();
  const deleteMutation = useDeleteAdminCharity();

  const charities = useMemo(
    () => (Array.isArray(charitiesQuery.data) ? charitiesQuery.data : []),
    [charitiesQuery.data],
  );
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  const handleEdit = (charity) => {
    setEditingId(charity._id);
    setForm({
      name: charity.name || "",
      description: charity.description || "",
      image: charity.image || "",
      isFeatured: Boolean(charity.isFeatured),
    });
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      isFeatured: Boolean(form.isFeatured),
    };
    if (!payload.name) {
      setError("Charity name is required");
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ charityId: editingId, payload });
        setSuccessMessage("Charity updated successfully.");
      } else {
        await createMutation.mutateAsync(payload);
        setSuccessMessage("Charity created successfully.");
      }
      resetForm();
    } catch (submissionError) {
      setError(getErrorMessage(submissionError, "Unable to save charity"));
    }
  };

  const handleDelete = async (charityId) => {
    setError("");
    setSuccessMessage("");
    try {
      await deleteMutation.mutateAsync(charityId);
      if (editingId === charityId) resetForm();
      setSuccessMessage("Charity deleted successfully.");
    } catch (deletionError) {
      setError(getErrorMessage(deletionError, "Unable to delete charity"));
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-hero">
        <p className="section-label">Charity management</p>
        <h1 className="section-title">
          Create and curate the causes users can support through their
          subscriptions.
        </h1>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardCard
          title={editingId ? "Edit Charity" : "Add Charity"}
          description="Manage public-facing charity data."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <InputField
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Charity name"
              required
            />
            <InputField
              as="textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Short description"
            />
            <InputField
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="Image URL"
            />
            <label className="surface-muted flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-600 bg-slate-950"
              />
              Mark as featured
            </label>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingId
                    ? "Update charity"
                    : "Create charity"}
              </Button>
              {editingId ? (
                <Button variant="secondary" type="button" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </DashboardCard>

        <DashboardCard
          title="Charity Directory"
          description="Search, filter featured causes, and manage donation-facing content."
        >
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <InputField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
            />
            <Button
              variant={featuredOnly ? "primary" : "secondary"}
              type="button"
              onClick={() => setFeaturedOnly((c) => !c)}
            >
              {featuredOnly ? "Showing featured" : "Filter featured"}
            </Button>
          </div>

          {charitiesQuery.isLoading && (
            <div className="space-y-3">
              <SkeletonBlock className="h-14" />
              <SkeletonBlock className="h-14" />
            </div>
          )}
          {charitiesQuery.isError && (
            <div className="py-10 text-center text-rose-300">
              {getErrorMessage(
                charitiesQuery.error,
                "Unable to load charities",
              )}
            </div>
          )}
          {!charitiesQuery.isLoading &&
            !charitiesQuery.isError &&
            charities.length === 0 && (
              <EmptyState
                title="No charities found"
                description="Create a new charity or adjust filters."
              />
            )}
          {!charitiesQuery.isLoading &&
            !charitiesQuery.isError &&
            charities.length > 0 && (
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Charity</th>
                      <th>Featured</th>
                      <th>Total Donations</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charities.map((charity) => (
                      <tr key={charity._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                              {charity.image ? (
                                <img
                                  src={charity.image}
                                  alt={charity.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                  No img
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">
                                {charity.name}
                              </p>
                              <p className="line-clamp-2 text-sm text-slate-400">
                                {charity.description || "No description."}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {charity.isFeatured ? (
                            <StatusBadge>featured</StatusBadge>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </td>
                        <td className="text-slate-300">
                          ${Number(charity.totalDonations || 0).toFixed(2)}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              type="button"
                              onClick={() => handleEdit(charity)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              type="button"
                              onClick={() => handleDelete(charity._id)}
                              disabled={deleteMutation.isPending}
                            >
                              Delete
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
    </div>
  );
}
