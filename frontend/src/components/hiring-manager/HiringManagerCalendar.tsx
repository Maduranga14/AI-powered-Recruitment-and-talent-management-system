import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ClipboardCheckIcon,
  ExternalLinkIcon,
  LightbulbIcon,
  Loader2Icon,
  VideoIcon,
  XIcon,
} from 'lucide-react';
import type { ManagerInterview } from '../../data/hiringManager';
import type { InterviewDto, GoogleCalendarStatus } from '../../services/api';
import { managerApi, googleCalendarApi } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { InterviewFeedbackModal } from './InterviewFeedbackModal';
import { GoogleCalendarCard } from './GoogleCalendarCard';


interface HiringManagerCalendarProps {
  interviews: ManagerInterview[];
  onOpenFeedback: (candidateId: string) => void;
  onRescheduleRequested?: () => void;
  onFeedbackSubmitted?: () => void;
}

function toMeetingUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function HiringManagerCalendar({
  interviews,
  onRescheduleRequested,
  onFeedbackSubmitted,
}: HiringManagerCalendarProps) {
  const [message, setMessage] = useState('');
  const [rescheduleTarget, setRescheduleTarget] =
    useState<ManagerInterview | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Interview feedback modal state
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewDto | null>(null);

  // Google Calendar integration state
  const [calendarStatus, setCalendarStatus] = useState<GoogleCalendarStatus | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [syncingInterviewId, setSyncingInterviewId] = useState<string | null>(null);

  const loadCalendarStatus = async () => {
    try {
      const status = await googleCalendarApi.getStatus();
      setCalendarStatus(status);
    } catch {
      // Fallback default state if API call fails
      setCalendarStatus({
        isConnected: false,
        autoSyncInterviews: true,
        calendarId: 'primary',
        clientIdConfigured: false,
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get('code');

    if (authCode) {
      window.history.replaceState({}, document.title, window.location.pathname + '?tab=calendar');
      googleCalendarApi
        .connect({ authorizationCode: authCode })
        .then((res) => {
          setCalendarStatus(res.data);
          showMessage('Connected Google Calendar with OAuth 2.0! 🎉');
        })
        .catch(() => loadCalendarStatus());
    } else {
      loadCalendarStatus();
    }
  }, []);


  const showMessage = (next: string) => {
    setMessage(next);
    window.setTimeout(() => setMessage(''), 2800);
  };

  const handleSyncSingleInterview = async (interview: ManagerInterview) => {
    setSyncingInterviewId(interview.id);
    try {
      const res = await googleCalendarApi.syncInterview(interview.id);
      showMessage(res.message || `Synced interview with ${interview.candidate} to Google Calendar.`);
      if (res.data.directWebCalendarUrl) {
        window.open(res.data.directWebCalendarUrl, '_blank', 'noopener,noreferrer');
      }
      onFeedbackSubmitted?.(); // Trigger parent refresh to reload interview list
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : 'Failed to sync interview.');
    } finally {
      setSyncingInterviewId(null);
    }

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

  const handleOpenFeedback = (interview: ManagerInterview) => {
    // Build a minimal InterviewDto from the ManagerInterview to pass to the modal
    const dto: InterviewDto = {
      id: interview.id,
      applicationId: interview.candidateId,
      jobPostingId: '',
      candidateName: interview.candidate,
      candidateEmail: '',
      photoUrl: interview.avatar,
      jobTitle: interview.role,
      scheduledAt: interview.scheduledAt ?? new Date().toISOString(),
      durationMinutes: parseInt(interview.duration) || 60,
      interviewType: interview.format,
      meetingLink: interview.meetingLink ?? null,
      location: null,
      interviewerName: '',
      notes: interview.focus,
      applicationStatus: 'Interview',
    };
    setFeedbackInterview(dto);
  };

  const handleFeedbackSubmit = async (
    interviewId: string,
    payload: {
      recommendation: string;
      comments: string;
      overallRating: number;
      skillRatings?: string;
      technicalAssessmentScore?: number | null;
      decision?: 'Hired' | 'Offer' | 'Rejected' | 'UnderFinalReview';
    }
  ) => {
    await managerApi.submitInterviewFeedback(interviewId, payload);
    if (payload.decision && payload.decision !== 'UnderFinalReview') {
      const targetInterview = feedbackInterview;
      if (targetInterview?.applicationId) {
        await managerApi.makeHiringDecision(targetInterview.applicationId, {
          decision: payload.decision === 'Offer' ? 'Hired' : payload.decision,
          notes: payload.comments,
        });
      }
    }
    setFeedbackInterview(null);
    showMessage(
      payload.decision === 'Offer' || payload.decision === 'Hired'
        ? 'Feedback submitted & Offer extended 🎉'
        : payload.decision === 'Rejected'
          ? 'Feedback submitted & Application rejected.'
          : 'Interview feedback submitted. Application moved to Under Final Review.'
    );
    onFeedbackSubmitted?.();
  };

  const upcoming = [...interviews].sort((a, b) => {
    const nowMs = Date.now();
    const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;

    if (!ta && !tb) return 0;
    if (!ta) return 1;
    if (!tb) return -1;

    const diffA = ta - nowMs;
    const diffB = tb - nowMs;

    // Both in future: nearest future interview first (smallest positive diff)
    if (diffA >= 0 && diffB >= 0) return diffA - diffB;
    // Future comes before past
    if (diffA >= 0 && diffB < 0) return -1;
    if (diffA < 0 && diffB >= 0) return 1;
    // Both in past: most recent past interview first
    return Math.abs(diffA) - Math.abs(diffB);
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

      {/* Google Calendar Integration Card */}
      <div className="mt-6">
        <GoogleCalendarCard
          status={calendarStatus}
          onStatusChange={setCalendarStatus}
          onMessage={showMessage}
          onSyncComplete={onFeedbackSubmitted}
        />

      </div>

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
                      {interview.feedbackSubmitted && (
                        <Badge tone="green">
                          <CheckCircle2Icon className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                      {interview.isSyncedToGoogleCalendar ? (
                        <Badge tone="accent">
                          <CalendarDaysIcon className="h-3 w-3 text-brand-600" />
                          In Google Calendar ✓
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Clock3Icon className="h-4 w-4 text-slate-400" />
                      {interview.time} &middot; {interview.duration}
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
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {/* Google Calendar Sync Button */}
                    {interview.isSyncedToGoogleCalendar && interview.googleCalendarHtmlLink ? (
                      <a
                        href={interview.googleCalendarHtmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        title="Open event in Google Calendar"
                      >
                        <CalendarDaysIcon className="h-3.5 w-3.5 text-brand-600" />
                        Open in Google Calendar ↗
                      </a>
                    ) : (
                      <button
                        onClick={() => handleSyncSingleInterview(interview)}
                        disabled={syncingInterviewId === interview.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        title="Sync to Google Calendar"
                      >
                        {syncingInterviewId === interview.id ? (
                          <Loader2Icon className="h-3.5 w-3.5 animate-spin text-brand-600" />
                        ) : (
                          <CalendarDaysIcon className="h-3.5 w-3.5 text-brand-600" />
                        )}
                        Add to Google Calendar
                      </button>
                    )}


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
                      disabled={interview.rescheduleRequested || interview.feedbackSubmitted}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      {interview.rescheduleRequested
                        ? 'Requested'
                        : 'Reschedule'}
                    </button>
                  </div>

                </div>
                {/* Add Feedback / Feedback Submitted actions */}
                {interview.feedbackSubmitted ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
                    <CheckCircle2Icon className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">
                      Interview Completed &mdash; Feedback submitted
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenFeedback(interview)}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-brand-200 hover:bg-brand-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <ClipboardCheckIcon className="h-4 w-4" />
                    Add Interview Feedback
                  </button>
                )}
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
                    {rescheduleTarget.candidate} &middot; {rescheduleTarget.role}
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
                      <Loader2Icon className="h-4 w-4 animate-spin" /> Sending&hellip;
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

      {/* Post-interview Feedback Modal */}
      <InterviewFeedbackModal
        interview={feedbackInterview}
        onClose={() => setFeedbackInterview(null)}
        onSubmit={handleFeedbackSubmit}
      />
    </motion.div>
  );
}


