import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClockIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ExternalLinkIcon,
  LightbulbIcon,
  Loader2Icon,
  VideoIcon,
  XIcon,
} from 'lucide-react';
import type { ManagerInterview } from '../../data/hiringManager';
import { managerApi } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';

interface HiringManagerCalendarProps {
  interviews: ManagerInterview[];
  onOpenFeedback: (candidateId: string) => void;
  onRescheduleRequested?: () => void;
}

function toMeetingUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function HiringManagerCalendar({
  interviews,
  onOpenFeedback,
  onRescheduleRequested,
}: HiringManagerCalendarProps) {
  const [message, setMessage] = useState('');
  const [rescheduleTarget, setRescheduleTarget] =
    useState<ManagerInterview | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const showMessage = (next: string) => {
    setMessage(next);
    window.setTimeout(() => setMessage(''), 2800);
  };

  const submitRescheduleRequest = async () => {
    if (!rescheduleTarget) return;
    setSubmitting(true);
    setError('');
    try {
      await managerApi.requestReschedule(
        rescheduleTarget.id,
        reason.trim() || undefined
      );
      setRescheduleTarget(null);
      setReason('');
      showMessage(
        `Reschedule requested for ${rescheduleTarget.candidate}. The recruiter will pick a new time.`
      );
      onRescheduleRequested?.();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to request reschedule.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const upcoming = [...interviews].sort((a, b) => {
    const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return ta - tb;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1280px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Interview calendar
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join meetings, request a new time, and close feedback quickly.
          </p>
        </div>
        <Badge tone="accent">
          <CalendarClockIcon className="h-3.5 w-3.5" /> {upcoming.length}{' '}
          upcoming
        </Badge>
      </div>

      {message && (
        <div
          role="status"
          className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          <CheckCircle2Icon className="h-4 w-4" />
          {message}
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          aria-labelledby="upcoming-interviews-title"
        >
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2
              id="upcoming-interviews-title"
              className="font-display text-lg font-bold"
            >
              Upcoming interviews
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your assigned conversations and their preparation notes.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {upcoming.length === 0 && (
              <p className="px-6 py-12 text-center text-sm text-slate-500">
                No interviews scheduled for your roles yet.
              </p>
            )}
            {upcoming.map((interview) => (
              <article key={interview.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <img
                    src={interview.avatar}
                    alt=""
                    className="h-12 w-12 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-800">
                        {interview.candidate}
                      </h3>
                      <Badge tone="brand">{interview.role}</Badge>
                      {interview.rescheduleRequested && (
                        <Badge tone="amber">Reschedule requested</Badge>
                      )}
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Clock3Icon className="h-4 w-4 text-slate-400" />
                      {interview.time} · {interview.duration}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <VideoIcon className="h-3.5 w-3.5" />
                      {interview.format}
                    </p>
                    {interview.rescheduleReason && (
                      <p className="mt-2 text-xs text-amber-700">
                        Note to recruiter: {interview.rescheduleReason}
                      </p>
                    )}
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Preparation focus
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {interview.focus}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {interview.meetingLink && (
                      <Button
                        size="sm"
                        onClick={() =>
                          window.open(
                            toMeetingUrl(interview.meetingLink!),
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                      >
                        <ExternalLinkIcon className="h-4 w-4" /> Join
                      </Button>
                    )}
                    <button
                      onClick={() => {
                        setError('');
                        setReason(interview.rescheduleReason || '');
                        setRescheduleTarget(interview);
                      }}
                      disabled={interview.rescheduleRequested}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      {interview.rescheduleRequested
                        ? 'Requested'
                        : 'Reschedule'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onOpenFeedback(interview.candidateId)}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Complete feedback <CheckCircle2Icon className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 shadow-soft sm:p-6">
            <LightbulbIcon className="h-5 w-5 text-brand-600" />
            <h2 className="mt-3 font-display text-lg font-bold">
              Need a new time?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Request a reschedule and the recruiter will update the interview
              and notify the candidate.
            </p>
          </section>
        </aside>
      </div>

      <AnimatePresence>
        {rescheduleTarget && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setRescheduleTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              role="dialog"
              aria-modal="true"
              className="relative z-10 w-full max-w-md rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Request reschedule
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {rescheduleTarget.candidate} · {rescheduleTarget.role}
                  </p>
                </div>
                <button
                  onClick={() => setRescheduleTarget(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 px-5 py-5">
                <p className="text-sm text-slate-600">
                  Current time:{' '}
                  <span className="font-semibold text-slate-800">
                    {rescheduleTarget.time}
                  </span>
                </p>
                <Textarea
                  label="Reason or preferred times (optional)"
                  placeholder="e.g. Conflict on Thursday AM — Friday after 2pm works."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}
              </div>
              <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => setRescheduleTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  disabled={submitting}
                  onClick={submitRescheduleRequest}
                >
                  {submitting ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    'Send to recruiter'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
