import { Link } from '@tanstack/react-router';

export default function Cancel() {
  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/40 bg-white/85 p-8 shadow-[0_24px_80px_rgba(20,57,44,0.16)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">Checkout cancelled</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900">No payment was completed.</h1>
      <p className="mt-3 text-stone-600">
        You can return to pricing at any time and start a new Stripe checkout session when you are ready.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/pricing" className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
          Back to pricing
        </Link>
        <Link to="/account" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-900">
          Return to account
        </Link>
      </div>
    </section>
  );
}
