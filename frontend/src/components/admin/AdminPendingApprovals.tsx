import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingIcon,
  Loader2Icon,
  RefreshCwIcon,
  UserCheckIcon,
} from 'lucide-react';
import { adminApi, type PendingRecruiter } from '../../services/api';
import { Button } from '../ui/Button';

export function AdminPendingApprovals() {
  const [pending, setPending] = useState<PendingRecruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await adminApi.getPendingRecruiters();
      setPending(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      await adminApi.approveRecruiter(id);
      setPending((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to approve recruiter.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    try {
      await adminApi.rejectRecruiter(id);
      setPending((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to reject recruiter.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Account governance</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Pending Approvals
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review and approve or reject new recruiter account applications.
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex flex-col items-center gap-3">
          <Loader2Icon className="h-7 w-7 animate-spin text-brand-600" />
          <p className="text-sm text-slate-500">Loading applications…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && pending.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-500">
            <UserCheckIcon className="h-8 w-8" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">All caught up!</p>
            <p className="mt-1 text-sm text-slate-500">
              There are no recruiter applications awaiting review.
            </p>
          </div>
        </div>
      )}

      {/* Applications list */}
      {!loading && pending.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <ClockIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {pending.length} application{pending.length !== 1 ? 's' : ''} awaiting review
            </span>
          </div>

          {pending.map((recruiter) => (
            <motion.div
              key={recruiter.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Info */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-bold text-base">
                    {recruiter.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{recruiter.fullName}</p>
                    <p className="text-sm text-slate-500">{recruiter.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <BuildingIcon className="h-3.5 w-3.5" />
                      <span>{recruiter.organizationName}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Applied{' '}
                      {new Date(recruiter.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:flex-col sm:items-end lg:flex-row">
                  <button
                    onClick={() => handleReject(recruiter.id)}
                    disabled={actioningId === recruiter.id}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(recruiter.id)}
                    disabled={actioningId === recruiter.id}
                    className="flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-semibold text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    {actioningId === recruiter.id ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4" />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
