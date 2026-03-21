import { Link, useRouterState } from '@tanstack/react-router';

const items = [
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/subscriptions', label: 'Subscriptions' },
  { to: '/admin/draws', label: 'Draws' },
  { to: '/admin/charity', label: 'Charity' },
  { to: '/admin/winnings', label: 'Winnings' },
];

export default function AdminSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="surface-card h-full p-4 xl:w-64">
      <div className="border-b border-slate-800 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Admin Panel</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Operations</h2>
      </div>

      <nav className="mt-4 flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);

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
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Live Controls</p>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Changes here affect production-facing membership, draw, charity, and payout workflows. Review each action carefully.
        </p>
      </div>
    </aside>
  );
}
