import Navbar from './components/layout/Navbar';

export default function App({ children }) {
  return (
    <div className="app-shell">
      <div className="page-wrap flex min-h-screen flex-col gap-6 overflow-x-hidden">
        <Navbar />

        <main className="flex flex-1 items-start">
          <div className="w-full overflow-x-hidden">{children}</div>
        </main>

        <footer className="surface-muted flex flex-col gap-3 px-6 py-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>Secure memberships, premium workflows, and charity-backed subscriptions in one polished SaaS workspace.</p>
          <p>Built with React, TanStack Router, and a production-ready Node backend.</p>
        </footer>
      </div>
    </div>
  );
}
