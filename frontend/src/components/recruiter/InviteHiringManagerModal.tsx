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
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <MailIcon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">
                      Invite Hiring Manager
                    </h2>
                    <p className="text-xs text-slate-500">Send an invitation to join your team</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {result ? (
                // ── Success state ──────────────────────────────────────────
                <div className="mt-6">
                  <div className="flex flex-col items-center text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-500">
                      <CheckCircleIcon className="h-7 w-7" />
                    </span>
                    <h3 className="mt-4 font-semibold text-slate-900">Invitation Sent!</h3>
                    <p className="mt-1.5 text-sm text-slate-500">{result.message}</p>
                  </div>

                  {/* Invite link (dev-only) */}
                  <div className="mt-5 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Invite Link (share this with the Hiring Manager)
                    </div>
                    <p className="mt-2 break-all rounded-lg bg-white p-2.5 text-xs font-mono text-slate-700 border border-slate-200">
                      {result.inviteLink}
                    </p>
                    <button
                      onClick={copyLink}
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
                    >
                      {copied ? (
                        <>
                          <CheckCircleIcon className="h-3.5 w-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-3.5 w-3.5" /> Copy link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Button onClick={reset} variant="outline" fullWidth size="sm">
                      Invite Another
                    </Button>
                    <Button onClick={handleClose} fullWidth size="sm">
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                // ── Form ────────────────────────────────────────────────────
                <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                  {error && (
                    <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100">
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
                    <label className="text-xs font-semibold text-slate-700">Department (Optional)</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">Select a department...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-slate-500">
                    They'll receive a registration link using your organization. The link expires in
                    72 hours.
                  </p>

                  <div className="flex gap-3">
                    <Button type="button" onClick={handleClose} variant="outline" fullWidth size="sm">
                      Cancel
                    </Button>
                    <Button type="submit" fullWidth size="sm" disabled={loading}>
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
