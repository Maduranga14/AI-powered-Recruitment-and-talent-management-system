import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XIcon,
  MailIcon,
  SendIcon,
  LinkIcon,
  CheckCircleIcon,
  CopyIcon,
} from 'lucide-react';
import { authApi, recruiterApi, type InviteResponse } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteHiringManagerModal({ open, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<InviteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      recruiterApi.getDepartments().then((res) => {
        setDepartments(res.departments || []);
      }).catch((err) => {
        console.error('Failed to load departments in invite modal:', err);
      });
    }
  }, [open]);

  const reset = () => {
    setEmail('');
    setDepartmentId('');
    setEmailError('');
    setError('');
    setResult(null);
    setCopied(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const copyLink = () => {
    if (result?.inviteLink) {
      navigator.clipboard.writeText(result.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    setError('');
    setLoading(true);

    try {
      const res = await authApi.inviteHiringManager({
        email: email.trim(),
        departmentId: departmentId || undefined,
      });
      setResult(res);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 text-white p-6 shadow-2xl backdrop-blur-2xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-teal-300 border border-brand-500/30">
                    <MailIcon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h2 className="font-display text-base font-bold text-white">
                      Invite Hiring Manager
                    </h2>
                    <p className="text-xs text-slate-300">Send an invitation to join your team</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {result ? (
                // ── Success state ──────────────────────────────────────────
                <div className="mt-6">
                  <div className="flex flex-col items-center text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircleIcon className="h-7 w-7" />
                    </span>
                    <h3 className="mt-4 font-bold text-white text-base">Invitation Sent!</h3>
                    <p className="mt-1.5 text-sm text-slate-300">{result.message}</p>
                  </div>

                  {/* Invite link (dev-only) */}
                  <div className="mt-5 rounded-xl border border-teal-500/30 bg-slate-950/70 p-4 text-white">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Invite Link (share this with the Hiring Manager)
                    </div>
                    <p className="mt-2 break-all rounded-lg bg-slate-800 p-2.5 text-xs font-mono text-slate-200 border border-slate-700">
                      {result.inviteLink}
                    </p>
                    <button
                      onClick={copyLink}
                      className="mt-2 flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-white underline"
                    >
                      {copied ? (
                        <>
                          <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-3.5 w-3.5" /> Copy link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Button onClick={reset} variant="outline" fullWidth size="sm" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold">
                      Invite Another
                    </Button>
                    <Button onClick={handleClose} fullWidth size="sm" className="bg-brand-600 hover:bg-brand-500 text-white font-bold">
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                // ── Form ────────────────────────────────────────────────────
                <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                  {error && (
                    <div className="rounded-xl bg-red-950/60 p-3.5 text-xs font-semibold text-red-200 border border-red-500/30">
                      {error}
                    </div>
                  )}

                  <Input
                    label="Hiring Manager's Email"
                    name="email"
                    type="email"
                    placeholder="manager@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={emailError}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">Department (Optional)</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                    >
                      <option value="" className="bg-slate-900 text-white">Select a department...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-slate-300">
                    They'll receive a registration link using your organization. The link expires in
                    72 hours.
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" onClick={handleClose} variant="outline" fullWidth size="sm" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold">
                      Cancel
                    </Button>
                    <Button type="submit" fullWidth size="sm" disabled={loading} className="bg-brand-600 hover:bg-brand-500 text-white font-bold">
                      {loading ? 'Sending…' : (
                        <span className="flex items-center gap-1.5">
                          <SendIcon className="h-3.5 w-3.5" />
                          Send Invite
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

        </>
      )}
    </AnimatePresence>
  );
}
