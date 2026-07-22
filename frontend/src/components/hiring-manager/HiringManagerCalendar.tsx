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
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  FilterIcon,
  RotateCcwIcon,
} from 'lucide-react';

import type { ManagerInterview } from '../../data/hiringManager';
import type { InterviewDto, GoogleCalendarStatus } from '../../services/api';
import { managerApi, googleCalendarApi } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { InterviewFeedbackModal } from './InterviewFeedbackModal';
import { GoogleCalendarCard } from './GoogleCalendarCard';
import { CalendarGridView } from './CalendarGridView';




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
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Interview feedback modal state
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewDto | null>(null);


  // Google Calendar integration state
  const [calendarStatus, setCalendarStatus] = useState<GoogleCalendarStatus | null>(null);
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

  const uniqueRoles = Array.from(new Set(interviews.map((i) => i.role))).filter(Boolean);

  const filteredInterviews = interviews.filter((interview) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCandidate = interview.candidate.toLowerCase().includes(q);
      const matchRole = interview.role.toLowerCase().includes(q);
      const matchFocus = interview.focus.toLowerCase().includes(q);
      if (!matchCandidate && !matchRole && !matchFocus) return false;
    }

    if (roleFilter !== 'all' && interview.role !== roleFilter) return false;
    if (formatFilter !== 'all' && interview.format.toLowerCase() !== formatFilter.toLowerCase()) return false;

    if (statusFilter === 'completed' && !interview.feedbackSubmitted) return false;
    if (statusFilter === 'pending' && interview.feedbackSubmitted) return false;
    if (statusFilter === 'reschedule' && !interview.rescheduleRequested) return false;
    if (statusFilter === 'gcal' && !interview.isSyncedToGoogleCalendar) return false;

    return true;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || roleFilter !== 'all' || formatFilter !== 'all' || statusFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setFormatFilter('all');
    setStatusFilter('all');
  };

  const upcoming = [...filteredInterviews].sort((a, b) => {

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
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGridIcon className="h-3.5 w-3.5" /> 5-Day Grid
            </button>

            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'agenda'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" /> Agenda List
            </button>
          </div>
          <Badge tone="accent">
            <CalendarClockIcon className="h-3.5 w-3.5" /> {upcoming.length}{' '}
            upcoming
          </Badge>
        </div>
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

      {/* Search & Filter Toolbar */}

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, role, or focus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="video">Video</option>
            <option value="phone">Phone</option>
            <option value="onsite">Onsite</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Feedback</option>
            <option value="completed">Feedback Completed</option>
            <option value="reschedule">Reschedule Requested</option>
            <option value="gcal">Synced to GCal</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              title="Clear search and filters"
            >
              <RotateCcwIcon className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-7 space-y-7">
        {viewMode === 'grid' && (
          <CalendarGridView
            interviews={filteredInterviews}
            onSyncSingleInterview={handleSyncSingleInterview}
            syncingInterviewId={syncingInterviewId}
            onRequestReschedule={(interview) => {
              setRescheduleTarget(interview);
              setReason('');
            }}
            onOpenFeedback={(interview) => handleOpenFeedback(interview)}
          />
        )}


        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
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
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                <p>{hasActiveFilters ? 'No interviews match your search and filter criteria.' : 'No interviews scheduled for your roles yet.'}</p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-slate-50 transition"
                  >
                    <RotateCcwIcon className="h-3.5 w-3.5" /> Clear filters
                  </button>
                )}
              </div>
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


