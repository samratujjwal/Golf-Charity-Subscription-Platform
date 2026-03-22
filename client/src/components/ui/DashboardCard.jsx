export default function DashboardCard({ title, value, description, badge, children }) {
  return (
    <article className="surface-card surface-glow w-full min-w-0 overflow-hidden p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(2,6,23,0.5)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
          {value ? <h3 className="mt-3 text-xl font-medium text-white md:text-2xl">{value}</h3> : null}
        </div>
        {badge}
      </div>
      {description ? <p className="mt-4 text-sm leading-7 text-slate-400">{description}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </article>
  );
}
