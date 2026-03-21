import { Link } from '@tanstack/react-router';

export default function NotFound() {
  return (
    <section className="rounded-[2rem] border border-white/40 bg-white/85 p-8 text-center shadow-[0_24px_80px_rgba(20,57,44,0.16)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">404</p>
      <h1 className="mt-4 font-serif text-4xl text-stone-900">Page not found</h1>
      <p className="mt-4 text-stone-600">
        The page you requested does not exist in this project foundation.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        Return home
      </Link>
    </section>
  );
}
