export default function EmptyState({ title, description }) {
  return (
    <div className="surface-muted flex min-h-48 flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-xl text-slate-300">
        +
      </div>
      <h3 className="text-xl font-medium text-white">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}
