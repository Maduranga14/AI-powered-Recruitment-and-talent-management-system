import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2Icon,
  CalendarDaysIcon,
  Clock3Icon,
  ExternalLinkIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshCwIcon,
  UserIcon,
  VideoIcon,
} from 'lucide-react';
import type { InterviewDto } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CandidateInterviewsProps {
  interviews: InterviewDto[];
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'Phone') return <PhoneIcon className="h-4 w-4" />;
  if (type === 'Onsite') return <Building2Icon className="h-4 w-4" />;
  return <VideoIcon className="h-4 w-4" />;
}

/** Ensure meeting links open correctly even if the recruiter omitted https:// */
function toMeetingUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatCountdown(iso: string): string | null {
  const at = new Date(iso).getTime();
  const now = Date.now();
  const diff = at - now;
  if (diff < -60 * 60 * 1000) return null;
  if (diff <= 0) return 'Starting now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `In ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `In ${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `In ${days} day${days === 1 ? '' : 's'}`;
}

function formatWhen(iso: string): string {
  const at = new Date(iso);
  return at.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function DateBlock({ iso }: { iso: string }) {
  const at = new Date(iso);
  return (
    <div className="flex h-[4.5rem] w-[4.5rem] flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
        {at.toLocaleDateString(undefined, { weekday: 'short' })}
      </span>
      <span className="font-display text-2xl font-extrabold leading-none">
        {at.getDate()}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {at.toLocaleDateString(undefined, { month: 'short' })}
      </span>
    </div>
  );
}

function InterviewCard({
  interview,
  featured = false,
}: {
  interview: InterviewDto;
  featured?: boolean;
}) {
  const at = new Date(interview.scheduledAt);
  const timeLabel = at.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateLabel = at.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const countdown = formatCountdown(interview.scheduledAt);
  const company = interview.company || 'Hiring team';
  const isPast = at.getTime() < Date.now() - 60 * 60 * 1000;
  const pendingReschedule = !!interview.rescheduleRequested && !isPast;
  const wasRescheduled = !!interview.lastRescheduledAt && !pendingReschedule;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-soft ${
        featured
          ? 'border-brand-200 ring-1 ring-brand-100'
          : pendingReschedule
            ? 'border-amber-200 ring-1 ring-amber-100'
            : wasRescheduled && !isPast
              ? 'border-emerald-200 ring-1 ring-emerald-100'
              : 'border-slate-200'
      } ${isPast ? 'opacity-75' : ''}`}
    >
      {featured && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500" />
      )}
      <div
        className={`flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6 ${featured ? 'pt-6' : ''}`}
      >
        <DateBlock iso={interview.scheduledAt} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {featured && !isPast && !pendingReschedule && (
              <Badge tone="brand">Up next</Badge>
            )}
            {isPast && <Badge tone="slate">Completed</Badge>}
            {pendingReschedule && (
              <Badge tone="amber">
                <RefreshCwIcon className="h-3 w-3" />
                Reschedule pending
              </Badge>
            )}
            {wasRescheduled && !isPast && (
              <Badge tone="green">
                <RefreshCwIcon className="h-3 w-3" />
                Rescheduled
              </Badge>
            )}
            {countdown && !isPast && !pendingReschedule && (
              <Badge tone="accent">{countdown}</Badge>
            )}
            <Badge tone="slate">
              <span className="inline-flex items-center gap-1">
                <TypeIcon type={interview.interviewType} />
                {interview.interviewType}
              </span>
            </Badge>
          </div>

          <h3 className="mt-2 font-display text-lg font-bold text-slate-900 sm:text-xl">
            {interview.jobTitle}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-slate-600">{company}</p>

          {pendingReschedule && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              <p className="font-semibold">Schedule change in progress</p>
              <p className="mt-0.5 text-amber-800/90">
                The hiring team asked to move this interview. Your current time
                still stands until the recruiter confirms a new slot
                {interview.rescheduleReason
                  ? ` — reason: ${interview.rescheduleReason}`
                  : ''}
                .
              </p>
            </div>
          )}

          {wasRescheduled && !isPast && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-950">
              <p className="font-semibold">Updated interview details</p>
              <p className="mt-0.5 text-emerald-900/80">
                Rescheduled{' '}
                {interview.lastRescheduledAt
                  ? formatWhen(interview.lastRescheduledAt)
                  : 'recently'}
                . Please use the new time and meeting details below.
              </p>
              <ul className="mt-2 space-y-1 text-emerald-900/90">
                <li>
                  <span className="font-medium">When:</span> {dateLabel} at{' '}
                  {timeLabel} ({interview.durationMinutes} min)
                </li>
                <li>
                  <span className="font-medium">Type:</span>{' '}
                  {interview.interviewType}
                </li>
                <li>
                  <span className="font-medium">Interviewer:</span>{' '}
                  {interview.interviewerName}
                </li>
                {interview.interviewType === 'Video' && interview.meetingLink && (
                  <li className="break-all">
                    <span className="font-medium">Meeting link:</span>{' '}
                    {interview.meetingLink}
                  </li>
                )}
                {interview.interviewType === 'Onsite' && interview.location && (
                  <li>
                    <span className="font-medium">Location:</span>{' '}
                    {interview.location}
                  </li>
                )}
                {interview.interviewType === 'Phone' && (
                  <li>The interviewer will contact you by phone.</li>
                )}
              </ul>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3Icon className="h-4 w-4 text-slate-400" />
              {timeLabel} · {interview.durationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="h-4 w-4 text-slate-400" />
              {interview.interviewerName}
            </span>
            {interview.interviewType === 'Onsite' && interview.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-slate-400" />
                {interview.location}
              </span>
            )}
          </div>

          {interview.notes && (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-600">
              {interview.notes}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {interview.meetingLink && !isPast && !pendingReschedule && (
              <Button
                size="sm"
                onClick={() => {
                  const url = toMeetingUrl(interview.meetingLink!);
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                <VideoIcon className="h-4 w-4" /> Join meeting
                <ExternalLinkIcon className="h-3.5 w-3.5 opacity-70" />
              </Button>
            )}
            <Link to={`/jobs/${interview.jobPostingId}`}>
              <Button size="sm" variant="outline">
                View role
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CandidateInterviews({ interviews }: CandidateInterviewsProps) {
  if (interviews.length === 0) return null;

  const now = Date.now();
  const upcoming = interviews
    .filter((i) => new Date(i.scheduledAt).getTime() >= now - 60 * 60 * 1000)
    .sort((a, b) => {
      // Surface pending / recently rescheduled interviews first
      const rank = (i: InterviewDto) =>
        i.rescheduleRequested ? 0 : i.lastRescheduledAt ? 1 : 2;
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      return (
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    });
  const past = interviews
    .filter((i) => new Date(i.scheduledAt).getTime() < now - 60 * 60 * 1000)
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

  const next = upcoming[0];
  const restUpcoming = upcoming.slice(1);
  const pendingCount = upcoming.filter((i) => i.rescheduleRequested).length;
  const rescheduledCount = upcoming.filter(
    (i) => i.lastRescheduledAt && !i.rescheduleRequested
  ).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      aria-label="Your interviews"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Interview schedule
          </p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900">
            Your upcoming interviews
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Prepare ahead — join links and details update when interviews are
            rescheduled.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {pendingCount > 0 && (
            <Badge tone="amber">{pendingCount} pending change</Badge>
          )}
          {rescheduledCount > 0 && (
            <Badge tone="green">{rescheduledCount} updated</Badge>
          )}
          <Badge tone="brand">{upcoming.length} upcoming</Badge>
        </div>
      </div>

      {next && <InterviewCard interview={next} featured />}

      {restUpcoming.length > 0 && (
        <div className="space-y-3">
          {restUpcoming.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}

      {upcoming.length === 0 && past.length > 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
          No upcoming interviews. Past sessions are listed below.
        </p>
      )}

      {past.length > 0 && (
        <div className="pt-2">
          <h3 className="mb-3 text-sm font-bold text-slate-700">
            Past interviews
          </h3>
          <div className="space-y-3">
            {past.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}
