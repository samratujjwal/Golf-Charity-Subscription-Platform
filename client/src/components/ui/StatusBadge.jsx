export default function StatusBadge({ status, children }) {
  const label = children || status || "unknown";
  const normalizedStatus = String(label).toLowerCase();

  const styles = {
    active: "border-emerald-400/30 bg-emerald-500/12 text-emerald-300",
    verified: "border-emerald-400/30 bg-emerald-500/12 text-emerald-300",
    paid: "border-emerald-400/30 bg-emerald-500/12 text-emerald-300",
    pending: "border-amber-400/30 bg-amber-500/12 text-amber-300",
    expired: "border-rose-400/30 bg-rose-500/12 text-rose-300",
    cancelled: "border-slate-400/20 bg-slate-500/10 text-slate-300",
    failed: "border-rose-400/30 bg-rose-500/12 text-rose-300",
    inactive: "border-slate-400/20 bg-slate-500/10 text-slate-300",
    watching: "border-sky-400/30 bg-sky-500/12 text-sky-300",
    winner: "border-fuchsia-400/30 bg-fuchsia-500/12 text-fuchsia-300",
    featured: "border-indigo-400/30 bg-indigo-500/12 text-indigo-300",
    // NEW: rejected status — clear red/orange to distinguish from system errors
    rejected: "border-orange-400/30 bg-orange-500/12 text-orange-300",
  };

  const styleClass =
    styles[normalizedStatus] ||
    "border-indigo-400/30 bg-indigo-500/12 text-indigo-300";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${styleClass}`}
    >
      {label}
    </span>
  );
}
