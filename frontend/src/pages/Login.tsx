import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Input';
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
        
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-black text-white">
            Talenta
          </span>
        </Link>

        <h1 className="mt-6 font-display text-2xl font-black text-white">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-300">
          Log in to continue your job search.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          {errors.form && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100">
              {errors.form}
            </div>
          )}
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
          
          <div>
            <PasswordInput
              label="Password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            
            <div className="mt-1.5 text-right">
              <Link
                to="/login"
                className="text-xs font-medium text-brand-600 hover:underline">
                
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
        </form>



        <p className="mt-6 text-center text-sm text-slate-500">
          New to Talenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-600 hover:underline">
            
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>);

}