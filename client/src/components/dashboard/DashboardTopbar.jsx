import { useNavigate } from '@tanstack/react-router';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardTopbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    await navigate({ to: '/login' });
  };

  return (
    <header className="surface-card sticky top-4 z-20 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your SaaS dashboard</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <StatusBadge>{user?.role || 'user'}</StatusBadge>
          <div className="surface-muted min-w-0 px-4 py-3 text-left sm:text-right">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button type="button" variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
