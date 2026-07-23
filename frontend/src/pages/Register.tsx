import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  CheckCircle2Icon,
  UserIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const candidatePerks = [
  'AI-ranked job matches tailored to your skills',
  'One-click application with your saved candidate profile',
  'Real-time status tracking for every application',
  'Private & secure profile until you choose to apply',
];

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    const pwdOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(form.password);
    if (!pwdOk) e.password = 'Use 8+ characters with uppercase, lowercase, number & special character';
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
    <div className="relative min-h-screen flex w-full flex-1 items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 px-4 py-16 text-white overflow-hidden">
      {/* Ambient Mesh Orbs */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl pointer-events-none" />
      <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-2xl grid md:grid-cols-2"
      >
        {/* Left Side: Candidate Perks & Branding */}
        <div className="flex flex-col justify-between border-b border-slate-800 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-8 sm:p-10 md:border-b-0 md:border-r">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-black text-white">
                Wayfare <span className="text-teal-400 font-semibold text-sm">Global</span>
              </span>
            </Link>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <SparklesIcon className="h-3.5 w-3.5" />
              Candidate Profile Registration
            </div>

            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Unlock AI-Powered Career Matches
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
              Build your verified candidate profile to connect with leading corporate employers and global talent teams.
            </p>

            <div className="mt-8 space-y-3.5">
              {candidatePerks.map((perk, i) => (
                <motion.div
                  key={perk}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 text-xs sm:text-sm font-medium text-slate-700"
                >
                  <CheckCircle2Icon className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200/80 pt-5 text-xs text-slate-400">
            Recruiter or Manager? Contact your system admin to receive an organization workspace invitation.
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">
              Create your account
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your details to start exploring opportunities
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {errors.form && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-semibold text-red-600">
                {errors.form}
              </div>
            )}

            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              icon={<UserIcon className="h-4 w-4 text-slate-400" />}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            <PasswordInput
              label="Password"
              name="password"
              placeholder="At least 8 chars (upper, lower, num & special)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            <Button type="submit" fullWidth size="lg" disabled={loading} className="mt-2">
              {loading ? 'Creating Account…' : 'Create Candidate Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}