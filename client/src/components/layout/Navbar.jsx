import { Link, useNavigate } from '@tanstack/react-router';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    await navigate({ to: '/login' });
  };

  return (
    <header className="sticky top-4 z-30">
      <nav className="surface-card flex min-h-18 items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_18px_35px_rgba(99,102,241,0.35)]">
            GP
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Membership OS
            </span>
            <span className="block truncate text-lg font-semibold text-white">Golf Charity Platform</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 text-sm font-medium text-slate-400 lg:flex">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/pricing" className="hover:text-white">
              Pricing
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-white">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link to="/login" className="hidden text-sm font-medium text-slate-400 hover:text-white md:inline-flex">
                Login
              </Link>
              <Link to="/register">
                <span className="app-button app-button-primary">Register</span>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <div className="hidden rounded-2xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-right md:block">
                <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <Button type="button" variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
