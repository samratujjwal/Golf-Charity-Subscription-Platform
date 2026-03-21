import { Link, useRouterState } from '@tanstack/react-router';

const items = [
  { to: '/dashboard', label: 'Overview', exact: true },
  { to: '/dashboard/subscription', label: 'Subscription' },
  { to: '/dashboard/scores', label: 'Scores' },
  { to: '/dashboard/draw', label: 'Draw' },
  { to: '/dashboard/charity', label: 'Charity' },
  { to: '/dashboard/winnings', label: 'Winnings' },
];

export default function DashboardSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="surface-card h-full p-4 xl:w-64">
      <div className="border-b border-slate-800 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Member Hub</h2>
      </div>

      <nav className="mt-4 flex flex-col gap-2">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_18px_35px_rgba(99,102,241,0.35)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="surface-muted mt-6 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">Impact</p>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Pick a charity before subscribing so every successful renewal supports a cause you care about.
        </p>
      </div>
    </aside>
  );
}
