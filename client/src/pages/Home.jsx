import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { healthApi } from '../services/api';

const initialState = {
  loading: true,
  message: '',
  error: null,
};

export default function Home() {
  const [state, setState] = useState(initialState);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchHealth = async () => {
      try {
        const response = await healthApi.getStatus();

        if (!isMounted) {
          return;
        }

        const health = response.data.data;

        setState({
          loading: false,
          message: health?.status === 'ok' ? 'API is running' : 'API status unavailable',
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error.response?.data?.error || error.message || 'Unable to reach the API';

        setState({
          loading: false,
          message: '',
          error: message,
        });
      }
    };

    fetchHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="section-hero overflow-hidden">
        <StatusBadge>Premium SaaS</StatusBadge>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Charity-first memberships</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-5xl">
          A polished golf subscription platform built for recurring giving and premium member workflows.
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-400">
          Run secure subscriptions, charity selection, draw participation, proof-backed winnings, and admin controls through one clean product experience.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {!isAuthenticated && (
            <>
              <Link to="/register">
                <span className="app-button app-button-primary">Create account</span>
              </Link>
              <Link to="/login">
                <span className="app-button app-button-secondary">Sign in</span>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link to="/pricing">
                <span className="app-button app-button-primary">View plans</span>
              </Link>
              <Link to="/account">
                <span className="app-button app-button-secondary">Open {user?.name || 'your'} account</span>
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="space-y-6">
        <section className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Platform status</p>
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <p className="text-sm text-slate-500">Health Check</p>
            <div className="mt-4 min-h-10 text-3xl font-semibold text-white">
              {state.loading && 'Checking API...'}
              {!state.loading && !state.error && state.message}
              {!state.loading && state.error && 'Connection failed'}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {state.error || 'The frontend is successfully talking to the backend and the monitoring endpoint is responding.'}
            </p>
          </div>
        </section>

        <section className="surface-card grid gap-4 p-6 sm:grid-cols-2">
          <div className="surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Subscriptions</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">Stripe-backed billing with webhook verified activation and renewal handling.</p>
          </div>
          <div className="surface-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rewards</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">Monthly draws, audited prize distribution, proof uploads, and payout tracking.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
