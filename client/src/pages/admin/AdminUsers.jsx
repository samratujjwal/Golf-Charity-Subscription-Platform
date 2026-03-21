import { useState } from 'react';
import Button from '../../components/ui/Button';
import DashboardCard from '../../components/ui/DashboardCard';
import InputField from '../../components/ui/InputField';
import SkeletonBlock from '../../components/ui/SkeletonBlock';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  useAdminUsers,
  useChangeUserRole,
  useToggleUserBlock,
  useUpdateAdminUser,
  useUpdateAdminUserScores,
} from '../../hooks/useAdmin';

const LIMIT = 10;
const EMPTY_SCORE = { value: '', date: '' };

function toDateInput(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
}

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [scoreEntries, setScoreEntries] = useState([{ ...EMPTY_SCORE }]);
  const [error, setError] = useState('');

  const usersQuery = useAdminUsers({ page, limit: LIMIT, search: search || undefined });
  const updateUserMutation = useUpdateAdminUser();
  const updateScoresMutation = useUpdateAdminUserScores();
  const blockMutation = useToggleUserBlock();
  const roleMutation = useChangeUserRole();

  const users = usersQuery.data?.items || [];
  const pagination = usersQuery.data?.pagination;
  const isSaving = updateUserMutation.isPending || updateScoresMutation.isPending;

  const openEditor = (user) => {
    const mappedScores = (user.scores || []).map((score) => ({
      value: String(score.value ?? ''),
      date: toDateInput(score.date),
    }));

    setSelectedUser(user);
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
    });
    setScoreEntries(mappedScores.length > 0 ? mappedScores : [{ ...EMPTY_SCORE }]);
    setError('');
  };

  const closeEditor = () => {
    setSelectedUser(null);
    setProfileForm({ name: '', email: '' });
    setScoreEntries([{ ...EMPTY_SCORE }]);
    setError('');
  };

  const handleToggleBlock = async (user) => {
    setError('');

    try {
      await blockMutation.mutateAsync({ userId: user.id, isBlocked: !user.isBlocked });
      if (selectedUser?.id === user.id) {
        setSelectedUser((current) => (current ? { ...current, isBlocked: !current.isBlocked } : current));
      }
    } catch (mutationError) {
      setError(mutationError.response?.data?.error || 'Unable to update block status');
    }
  };

  const handleRoleChange = async (userId, role) => {
    setError('');

    try {
      await roleMutation.mutateAsync({ userId, role });
      if (selectedUser?.id === userId) {
        setSelectedUser((current) => (current ? { ...current, role } : current));
      }
    } catch (mutationError) {
      setError(mutationError.response?.data?.error || 'Unable to update role');
    }
  };

  const handleScoreChange = (index, field, value) => {
    setScoreEntries((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, [field]: value } : entry)));
  };

  const handleAddScoreRow = () => {
    setScoreEntries((current) => {
      if (current.length >= 5) {
        return current;
      }

      return [...current, { ...EMPTY_SCORE }];
    });
  };

  const handleRemoveScoreRow = (index) => {
    setScoreEntries((current) => {
      const nextEntries = current.filter((_, entryIndex) => entryIndex !== index);
      return nextEntries.length > 0 ? nextEntries : [{ ...EMPTY_SCORE }];
    });
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    setError('');

    try {
      const response = await updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        payload: {
          name: profileForm.name,
          email: profileForm.email,
        },
      });

      const updatedUser = response.data.data;
      setSelectedUser((current) => (current ? { ...current, ...updatedUser } : current));
      setProfileForm({
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } catch (mutationError) {
      setError(mutationError.response?.data?.error || 'Unable to update user profile');
    }
  };

  const handleScoresSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    const normalizedScores = scoreEntries
      .filter((entry) => entry.value !== '' && entry.date)
      .map((entry) => ({
        value: Number(entry.value),
        date: new Date(`${entry.date}T00:00:00.000Z`).toISOString(),
      }))
      .sort((left, right) => new Date(right.date) - new Date(left.date));

    setError('');

    try {
      const response = await updateScoresMutation.mutateAsync({
        userId: selectedUser.id,
        scores: normalizedScores,
      });

      const updatedScores = response.data.data.scores || [];
      setSelectedUser((current) => (current ? { ...current, scores: updatedScores } : current));
      setScoreEntries(
        updatedScores.length > 0
          ? updatedScores.map((score) => ({
              value: String(score.value ?? ''),
              date: toDateInput(score.date),
            }))
          : [{ ...EMPTY_SCORE }],
      );
    } catch (mutationError) {
      setError(mutationError.response?.data?.error || 'Unable to update user scores');
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-hero">
        <p className="section-label">Users</p>
        <h1 className="section-title">Manage profiles, score history, access state, and elevated roles.</h1>
        <div className="mt-6 max-w-md">
          <InputField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email"
          />
        </div>
      </section>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <DashboardCard title="User Directory" description="Searchable admin controls with blocking, role changes, and score visibility.">
          {usersQuery.isLoading && (
            <div className="space-y-3">
              <SkeletonBlock className="h-14" />
              <SkeletonBlock className="h-14" />
              <SkeletonBlock className="h-14" />
            </div>
          )}

          {usersQuery.isError && <div className="py-10 text-center text-rose-300">{usersQuery.error?.response?.data?.error || 'Unable to load users'}</div>}

          {!usersQuery.isLoading && !usersQuery.isError && (
            <div className="space-y-4">
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Scores</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-slate-400">{user.email}</p>
                        </td>
                        <td>
                          <InputField as="select" value={user.role} onChange={(event) => handleRoleChange(user.id, event.target.value)}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </InputField>
                        </td>
                        <td>
                          <StatusBadge status={user.isBlocked ? 'failed' : 'active'}>{user.isBlocked ? 'Blocked' : 'Active'}</StatusBadge>
                        </td>
                        <td className="text-slate-400">{user.scores?.length || 0}/5 saved</td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" type="button" onClick={() => openEditor(user)}>Edit</Button>
                            <Button variant={user.isBlocked ? 'secondary' : 'danger'} type="button" onClick={() => handleToggleBlock(user)}>
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                <span>
                  Page {pagination?.page || 1} of {pagination?.totalPages || 1} ({pagination?.total || 0} users)
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={!pagination || page >= pagination.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DashboardCard>

        <div className="space-y-6">
          <DashboardCard
            title={selectedUser ? 'Edit User' : 'User Editor'}
            description={selectedUser ? 'Update profile fields without changing authentication logic.' : 'Select a user from the table to edit profile details and score history.'}
          >
            {!selectedUser ? (
              <div className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
                No user selected yet.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleProfileSubmit}>
                <InputField value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" />
                <InputField type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSaving}>{updateUserMutation.isPending ? 'Saving...' : 'Save profile'}</Button>
                  <Button variant="secondary" type="button" onClick={closeEditor}>Clear</Button>
                </div>
              </form>
            )}
          </DashboardCard>

          <DashboardCard title="Golf Scores" description="Admins can correct a user’s latest five Stableford scores while preserving backend validation.">
            {!selectedUser ? (
              <div className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
                Choose a user to manage score history.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleScoresSubmit}>
                <div className="space-y-3">
                  {scoreEntries.map((entry, index) => (
                    <div key={`${selectedUser.id}-score-${index}`} className="surface-muted grid gap-3 rounded-xl p-4 md:grid-cols-[1fr_1fr_auto]">
                      <InputField
                        type="number"
                        min="1"
                        max="45"
                        value={entry.value}
                        onChange={(event) => handleScoreChange(index, 'value', event.target.value)}
                        placeholder="Score value"
                      />
                      <InputField
                        type="date"
                        value={entry.date}
                        onChange={(event) => handleScoreChange(index, 'date', event.target.value)}
                      />
                      <Button variant="secondary" type="button" onClick={() => handleRemoveScoreRow(index)} disabled={scoreEntries.length === 1}>Remove</Button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Maximum 5 scores. Backend keeps them sorted newest first.</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" type="button" onClick={handleAddScoreRow} disabled={scoreEntries.length >= 5}>Add score</Button>
                    <Button type="submit" disabled={isSaving}>{updateScoresMutation.isPending ? 'Saving...' : 'Save scores'}</Button>
                  </div>
                </div>
              </form>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

