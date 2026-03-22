import { getErrorMessage } from "../../utils/getErrorMessage";
import { useState } from "react";
import Button from "../../components/ui/Button";
import DashboardCard from "../../components/ui/DashboardCard";
import InputField from "../../components/ui/InputField";
import SkeletonBlock from "../../components/ui/SkeletonBlock";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  useAdminUsers,
  useChangeUserRole,
  useToggleUserBlock,
  useUpdateAdminUser,
  useUpdateAdminUserScores,
} from "../../hooks/useAdmin";

const SCORE_TEMPLATE = { value: "", date: "" };

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Edit user profile modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  // Edit scores modal state
  const [scoringUser, setScoringUser] = useState(null);
  const [scoreRows, setScoreRows] = useState([{ ...SCORE_TEMPLATE }]);

  const usersQuery = useAdminUsers({
    page: 1,
    limit: 50,
    search: search || undefined,
  });
  const updateUserMutation = useUpdateAdminUser();
  const updateScoresMutation = useUpdateAdminUserScores();
  const toggleBlockMutation = useToggleUserBlock();
  const changeRoleMutation = useChangeUserRole();

  const users = usersQuery.data?.items || [];

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  /* ── Edit profile ── */
  const openEditUser = (user) => {
    clearMessages();
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        payload: editForm,
      });
      setSuccessMessage(`Profile updated for ${editForm.name}.`);
      setEditingUser(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update profile"));
    }
  };

  /* ── Edit scores ── */
  const openEditScores = (user) => {
    clearMessages();
    setScoringUser(user);
    const existing = (user.scores || []).map((s) => ({
      value: String(s.value),
      date: s.date ? new Date(s.date).toISOString().slice(0, 10) : "",
    }));
    setScoreRows(existing.length > 0 ? existing : [{ ...SCORE_TEMPLATE }]);
  };

  const handleScoreRowChange = (idx, field, val) => {
    setScoreRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: val } : r)),
    );
  };

  const addScoreRow = () => {
    if (scoreRows.length >= 5) return;
    setScoreRows((rows) => [...rows, { ...SCORE_TEMPLATE }]);
  };

  const removeScoreRow = (idx) => {
    setScoreRows((rows) => rows.filter((_, i) => i !== idx));
  };

  const handleSaveScores = async (e) => {
    e.preventDefault();
    clearMessages();
    const scores = scoreRows
      .filter((r) => r.value && r.date)
      .map((r) => ({ value: Number(r.value), date: r.date }));

    try {
      await updateScoresMutation.mutateAsync({
        userId: scoringUser.id,
        scores,
      });
      setSuccessMessage(`Scores updated for ${scoringUser.name}.`);
      setScoringUser(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update scores"));
    }
  };

  /* ── Block / unblock ── */
  const handleToggleBlock = async (user) => {
    clearMessages();
    try {
      await toggleBlockMutation.mutateAsync({
        userId: user.id,
        isBlocked: !user.isBlocked,
      });
      setSuccessMessage(
        `User ${user.isBlocked ? "unblocked" : "blocked"} successfully.`,
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update block state"));
    }
  };

  /* ── Change role ── */
  const handleChangeRole = async (user, role) => {
    clearMessages();
    try {
      await changeRoleMutation.mutateAsync({ userId: user.id, role });
      setSuccessMessage(`Role updated to "${role}" for ${user.name}.`);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update role"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="section-hero">
        <p className="section-label">User Management</p>
        <h1 className="section-title">
          View, edit, block, and manage all platform members.
        </h1>
      </section>

      {/* Feedback */}
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

      {/* Search */}
      <DashboardCard
        title="Search Users"
        description="Filter by name or email address."
      >
        <InputField
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
        />
      </DashboardCard>

      {/* Edit Profile Modal */}
      {editingUser && (
        <DashboardCard title={`Edit Profile — ${editingUser.name}`}>
          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Name
              </span>
              <InputField
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </span>
              <InputField
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DashboardCard>
      )}

      {/* Edit Scores Modal */}
      {scoringUser && (
        <DashboardCard
          title={`Edit Scores — ${scoringUser.name}`}
          description="Up to 5 scores. Values must be integers between 1 and 45."
        >
          <form className="space-y-4" onSubmit={handleSaveScores}>
            {scoreRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end"
              >
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">
                    Value (1–45)
                  </span>
                  <InputField
                    type="number"
                    min="1"
                    max="45"
                    value={row.value}
                    onChange={(e) =>
                      handleScoreRowChange(idx, "value", e.target.value)
                    }
                    placeholder="e.g. 32"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">
                    Date
                  </span>
                  <InputField
                    type="date"
                    value={row.date}
                    onChange={(e) =>
                      handleScoreRowChange(idx, "date", e.target.value)
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeScoreRow(idx)}
                  className="mb-0.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                >
                  Remove
                </button>
              </div>
            ))}

            {scoreRows.length < 5 && (
              <button
                type="button"
                onClick={addScoreRow}
                className="text-sm font-medium text-indigo-300 hover:text-indigo-200"
              >
                + Add score row
              </button>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={updateScoresMutation.isPending}>
                {updateScoresMutation.isPending ? "Saving…" : "Save scores"}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setScoringUser(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DashboardCard>
      )}

      {/* Users Table */}
      <DashboardCard
        title="All Members"
        description="Manage profiles, scores, roles, and access for every registered user."
      >
        {usersQuery.isLoading && (
          <div className="space-y-3">
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
            <SkeletonBlock className="h-14" />
          </div>
        )}

        {usersQuery.isError && (
          <div className="py-10 text-center text-rose-300">
            {getErrorMessage(usersQuery.error, "Unable to load users")}
          </div>
        )}

        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
          <div className="surface-muted rounded-xl px-4 py-10 text-center text-sm text-slate-400">
            No users found{search ? ` matching "${search}"` : ""}.
          </div>
        )}

        {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 && (
          <div className="table-shell">
            <table>
              <thead>
                <tr className="text-slate-500">
                  <th className="font-semibold">Member</th>
                  <th className="font-semibold">Role</th>
                  <th className="font-semibold">Status</th>
                  <th className="font-semibold">Scores</th>
                  <th className="font-semibold">Joined</th>
                  <th className="font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="align-top text-slate-300">
                    <td>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-slate-500">{user.email}</p>
                    </td>
                    <td>
                      <StatusBadge>{user.role}</StatusBadge>
                    </td>
                    <td>
                      {user.isBlocked ? (
                        <StatusBadge status="failed">Blocked</StatusBadge>
                      ) : (
                        <StatusBadge status="active">Active</StatusBadge>
                      )}
                    </td>
                    <td>
                      <span className="text-sm text-slate-400">
                        {(user.scores || []).length}/5
                      </span>
                    </td>
                    <td className="text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => openEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => openEditScores(user)}
                        >
                          Scores
                        </Button>
                        <Button
                          variant={user.isBlocked ? "primary" : "danger"}
                          type="button"
                          onClick={() => handleToggleBlock(user)}
                          disabled={toggleBlockMutation.isPending}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() =>
                            handleChangeRole(
                              user,
                              user.role === "admin" ? "user" : "admin",
                            )
                          }
                          disabled={changeRoleMutation.isPending}
                        >
                          {user.role === "admin" ? "Make user" : "Make admin"}
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
