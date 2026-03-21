import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { useAuth } from '../hooks/useAuth';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await register(form);
      setMessage(response.data.data.message);
      setForm(initialForm);
      await navigate({ to: '/login' });
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl surface-card p-8">
      <p className="section-label">Create account</p>
      <h1 className="section-title">Join the platform</h1>
      <p className="section-copy">Sign up securely to access charity memberships, protected areas, and future subscription tools.</p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-3 block text-sm font-medium text-white">Name</span>
          <InputField type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm font-medium text-white">Email</span>
          <InputField type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm font-medium text-white">Password</span>
          <InputField type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimum 8 characters" required />
        </label>

        {message && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}
        {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-white hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </section>
  );
}
