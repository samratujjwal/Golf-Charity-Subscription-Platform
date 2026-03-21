import { useState } from 'react';
import DashboardCard from '../../components/ui/DashboardCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAddScore, useEditScore, useScores } from '../../hooks/useScores';

const initialForm = {
  value: '',
  date: '',
};

export default function DashboardScores() {
  const scoresQuery = useScores();
  const addScoreMutation = useAddScore();
  const editScoreMutation = useEditScore();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const scores = scoresQuery.data?.scores || [];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingIndex(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editingIndex !== null) {
        await editScoreMutation.mutateAsync({
          index: editingIndex,
          payload: form,
        });
      } else {
        await addScoreMutation.mutateAsync(form);
      }

      resetForm();
    } catch (submissionError) {
      setError(submissionError.response?.data?.error || 'Unable to save score');
    }
  };

  const handleEdit = (score, index) => {
    setEditingIndex(index);
    setForm({
      value: String(score.value),
      date: score.date.slice(0, 10),
    });
    setError('');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/50 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Scores</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Stableford score management
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Store your latest five Stableford rounds with backend-enforced limits, UTC-safe dates, and reverse chronological ordering.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardCard
          title="Add Score"
          description="Stableford values must be between 1 and 45. Once you hit five scores, the oldest one is replaced automatically."
          badge={<StatusBadge>{`${scores.length}/5`}</StatusBadge>}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Score value</span>
                <input
                  type="number"
                  name="value"
                  min="1"
                  max="45"
                  value={form.value}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-950"
                  placeholder="e.g. 32"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Date</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-950"
                  required
                />
              </label>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={addScoreMutation.isPending || editScoreMutation.isPending}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingIndex !== null
                  ? editScoreMutation.isPending
                    ? 'Saving changes...'
                    : 'Save score'
                  : addScoreMutation.isPending
                    ? 'Adding score...'
                    : 'Add score'}
              </button>

              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </DashboardCard>

        <DashboardCard
          title="Latest Scores"
          description="Your list always returns newest first and stays capped at five backend-verified entries."
        >
          {scoresQuery.isLoading && (
            <div className="flex min-h-40 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
            </div>
          )}

          {scoresQuery.isError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {scoresQuery.error?.response?.data?.error || 'Unable to load scores'}
            </div>
          )}

          {!scoresQuery.isLoading && !scoresQuery.isError && scores.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-600">
              No scores yet. Add your first Stableford round to start the history.
            </div>
          )}

          {!scoresQuery.isLoading && !scoresQuery.isError && scores.length > 0 && (
            <div className="space-y-3">
              {scores.map((score, index) => (
                <div
                  key={`${score.date}-${score.value}-${index}`}
                  className={`rounded-[1.5rem] border px-4 py-4 transition ${
                    index === 0
                      ? 'border-sky-200 bg-sky-50 shadow-[0_14px_40px_rgba(14,165,233,0.12)]'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {index === 0 ? 'Latest score' : `Stored score ${scores.length - index}`}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                        {score.value} pts
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(score.date).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEdit(score, index)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
