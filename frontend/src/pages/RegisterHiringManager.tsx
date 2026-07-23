import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  Loader2Icon,
  BuildingIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { authApi, type InviteInfo } from '../services/api';

export function RegisterHiringManager() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { login } = useAuth();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [validating, setValidating] = useState(true);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // ── Validate token on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setTokenError('No invitation token found. Please use the link from your invitation email.');
      setValidating(false);
      return;
    }

    (async () => {
      try {
        const info = await authApi.validateInvite(token);
        setInvite(info);
      } catch (err: any) {
        setTokenError(err.message || 'This invitation link is invalid or has expired.');
      } finally {
        setValidating(false);
      }
    })();
  }, [token]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    (async () => {
      try {
        const res = await authApi.registerHiringManager({
          token,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
        });

        // Log them in immediately
        await login(invite!.invitedEmail, form.password);
        navigate('/hiring-manager');
      } catch (err: any) {
        setErrors({ form: err.message || 'Registration failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    })();
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (validating) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-sm text-slate-500">Validating your invitation…</p>
        </div>
      </div>
    );
  }

  // ── Invalid token ──────────────────────────────────────────────────────
  if (tokenError) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-soft"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertTriangleIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-slate-900">
            Invalid Invitation
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{tokenError}</p>
          <div className="mt-6 space-y-3">
            <p className="text-xs text-slate-400">
              Ask your recruiter to send a new invitation link.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-semibold text-brand-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Valid token → registration form ───────────────────────────────────
  return (
    <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold text-white">Wayfare <span className="text-teal-400 font-semibold text-sm">Global</span></span>
        </Link>

        {/* Header */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-xl font-extrabold text-slate-900">
                Complete Your Registration
              </h1>
              <p className="text-xs text-slate-500">Hiring Manager Account</p>
            </div>
          </div>

          {/* Pre-filled invite info (read-only) */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Invitation Details
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-500 w-12">Email</span>
                <span className="font-semibold text-slate-900">{invite?.invitedEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BuildingIcon className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-900">{invite?.organizationName}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {errors.form && (
              <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                name="firstName"
                placeholder="Alex"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                name="lastName"
                placeholder="Morgan"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                error={errors.lastName}
              />
            </div>

            <PasswordInput
              label="Password"
              name="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
            />

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account & Log In'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
