import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, CheckIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
const perks = [
  'AI-ranked job matches tailored to you',
  'One-click apply with your saved profile',
  'Track every application in one place',
  'Private until you choose to share'];

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Use at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    (async () => {
      try {
        await register(form.name.trim(), form.email.trim(), form.password);
        navigate(redirect);
      } catch (err: any) {
        setErrors({ form: err.message || 'Registration failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    })();
  };
  return (
    <div className="grid w-full flex-1 lg:grid-cols-2">

      <div className="relative hidden flex-col justify-between bg-brand-700 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold">Talenta</span>
        </Link>
        <div>
          <h2 className="max-w-md font-display text-3xl font-extrabold leading-tight">
            Join thousands landing roles they love with AI.
          </h2>
          <ul className="mt-8 space-y-4">
            {perks.map((p) =>
              <li key={p} className="flex items-center gap-3 text-brand-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {p}
              </li>
            )}
          </ul>
        </div>
        <p className="text-sm text-brand-200">Free forever for job seekers.</p>
      </div>


      <div className="flex items-center justify-center bg-white px-4 py-12 sm:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 16
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="w-full max-w-md">

          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-extrabold text-slate-900">
                Talenta
              </span>
            </Link>
          </div>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-slate-900 lg:mt-0">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Start your smarter job search today.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            {errors.form && (
              <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100">
                {errors.form}
              </div>
            )}
            <Input
              label="Full name"
              name="name"
              placeholder="Alex Morgan"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              error={errors.name} />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
              error={errors.email} />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
              error={errors.password} />

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:underline">

              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>);

}