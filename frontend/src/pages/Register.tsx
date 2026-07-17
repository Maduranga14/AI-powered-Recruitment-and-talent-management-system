import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  CheckIcon,
  BriefcaseIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  BuildingIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const candidatePerks = [
  'AI-ranked job matches tailored to you',
  'One-click apply with your saved profile',
  'Track every application in one place',
  'Private until you choose to share',
];

const recruiterPerks = [
  'Post jobs and reach thousands of candidates',
  'AI-powered candidate scoring & ranking',
  'Invite Hiring Managers to collaborate',
  'Analytics dashboard for your pipeline',
];

type Role = 'candidate' | 'recruiter';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const [role, setRole] = useState<Role>('candidate');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pendingSuccess, setPendingSuccess] = useState(false);

  const perks = role === 'candidate' ? candidatePerks : recruiterPerks;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    const pwdOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(form.password);
    if (!pwdOk) e.password = 'Use 8+ chars with uppercase, lowercase, number & special character';
    if (role === 'recruiter') {
      if (!form.organizationName.trim()) e.organizationName = 'Please enter your organization name';
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    (async () => {
      try {
        if (role === 'candidate') {
          const parts = form.name.trim().split(/\s+/);
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || 'User';
          // AuthContext.register calls the backend and sets the session
          await register(form.name.trim(), form.email.trim(), form.password);
          navigate(redirect);
        } else {
          // Recruiter — submit to different endpoint, show pending screen
          const parts = form.name.trim().split(/\s+/);
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || 'User';
          await authApi.registerRecruiter({
            firstName,
            lastName,
            email: form.email.trim(),
            password: form.password,
            confirmPassword: form.confirmPassword,
            organizationName: form.organizationName.trim(),
          });
          setPendingSuccess(true);
        }
      } catch (err: any) {
        setErrors({ form: err.message || 'Registration failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    })();
  };

  // ── Pending approval success screen ─────────────────────────────────────
  if (pendingSuccess) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-soft"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <ClockIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-slate-900">
            Application Submitted!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Your recruiter account for{' '}
            <span className="font-semibold text-slate-700">{form.organizationName}</span> is under
            review. An administrator will approve your account within 1–2 business days.
          </p>
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-left">
            <p className="text-xs font-semibold text-amber-700">What happens next?</p>
            <ul className="mt-2 space-y-1.5 text-xs text-amber-600">
              <li className="flex gap-2">
                <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Admin reviews your application
              </li>
              <li className="flex gap-2">
                <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                You'll be able to log in once approved
              </li>
              <li className="flex gap-2">
                <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Post jobs and invite Hiring Managers
              </li>
            </ul>
          </div>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:underline"
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid w-full flex-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-brand-700 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold">Talenta</span>
        </Link>
        <div>
          <h2 className="max-w-md font-display text-3xl font-extrabold leading-tight">
            {role === 'candidate'
              ? 'Join thousands landing roles they love with AI.'
              : 'Find top talent faster with AI-powered recruiting.'}
          </h2>
          <ul className="mt-8 space-y-4">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-brand-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-brand-200">
          {role === 'candidate' ? 'Free forever for job seekers.' : 'Start hiring in minutes.'}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-white px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-extrabold text-slate-900">Talenta</span>
            </Link>
          </div>

          <h1 className="mt-6 font-display text-2xl font-extrabold text-slate-900 lg:mt-0">
            Create your account
          </h1>

          {/* ── Role Selector ─────────────────────────────────── */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setRole('candidate'); setErrors({}); }}
              className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                role === 'candidate'
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => { setRole('recruiter'); setErrors({}); }}
              className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                role === 'recruiter'
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <BriefcaseIcon className="h-4 w-4" />
              Recruiter
            </button>
          </div>

          {role === 'recruiter' && (
            <div className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
              <span className="font-semibold">Note:</span> Recruiter accounts require admin approval
              before you can log in.
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
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
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            {/* Recruiter-only fields */}
            <AnimatePresence>
              {role === 'recruiter' && (
                <motion.div
                  key="recruiter-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                  />
                  <div>
                    <label htmlFor="organizationName" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Organization Name
                    </label>
                    <div className="relative">
                      <BuildingIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="organizationName"
                        name="organizationName"
                        type="text"
                        placeholder="Acme Corp"
                        value={form.organizationName}
                        onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          errors.organizationName
                            ? 'border-red-300 bg-red-50 focus:ring-red-400'
                            : 'border-slate-200 bg-slate-50 focus:border-brand-400 focus:bg-white'
                        }`}
                      />
                    </div>
                    {errors.organizationName && (
                      <p className="mt-1 text-xs text-red-500">{errors.organizationName}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading
                ? 'Processing…'
                : role === 'candidate'
                ? 'Create account'
                : 'Submit application'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}