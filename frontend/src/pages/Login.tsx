import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    
    // Perform login
    (async () => {
      try {
        await login(form.email.trim(), form.password);
        
        const emailLower = form.email.toLowerCase();
        let targetRedirect = redirect;
        if (emailLower.includes('admin')) {
          targetRedirect = '/admin';
        } else if (emailLower.includes('recruiter')) {
          targetRedirect = '/recruiter';
        } else if (emailLower.includes('manager')) {
          targetRedirect = '/hiring-manager';
        }
        
        navigate(targetRedirect);
      } catch (err: any) {
        setErrors({ form: err.message || 'Login failed. Please check your credentials.' });
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
        initial={{
          opacity: 0,
          y: 16
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl">
        
        <Logo to="/" size="md" />

        <h1 className="mt-6 font-display text-2xl font-black text-white">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to your Wayfare Global account
        </p>

        {errors.form &&
        <div className="mt-4 rounded-xl bg-red-500/20 border border-red-500/30 p-3 text-sm text-red-300">
            {errors.form}
          </div>
        }

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="you@example.com"
          />

          <div>
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="••••••••"
            />

            <div className="mt-2 text-right">
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions will be sent to your email.');
                }}
                className="text-xs font-medium text-teal-400 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading} className="bg-brand-600 hover:bg-brand-500 text-white font-bold">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          New to Wayfare Global?{' '}
          <Link
            to="/register"
            className="font-bold text-teal-300 hover:underline">
            
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>);

}