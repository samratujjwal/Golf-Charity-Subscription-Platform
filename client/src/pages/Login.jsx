import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/getErrorMessage";

const initialForm = {
  email: "",
  password: "",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(form);
      await navigate({ to: "/dashboard" });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Login failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl surface-card p-8">
      <p className="section-label">Welcome back</p>
      <h1 className="section-title">Sign in to your account</h1>
      <p className="section-copy">
        Access your billing, dashboard, and protected member workspace.
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-3 block text-sm font-medium text-white">
            Email
          </span>
          <InputField
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm font-medium text-white">
            Password
          </span>
          <InputField
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </label>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error.message || error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        New here?{" "}
        <Link
          to="/register"
          className="font-semibold text-white hover:text-indigo-300"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
