import { motion } from 'framer-motion';
import {
  CalendarPlusIcon,
  Clock3Icon,
  LinkIcon,
  MapPinIcon,
  VideoIcon,
  PhoneIcon,
  Building2Icon,
} from 'lucide-react';
import type { RecruiterInterview } from '../../data/recruiter';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RecruiterScheduleProps {
  interviews: RecruiterInterview[];
  loading?: boolean;
  onSchedule: () => void;
  onReschedule: (interview: RecruiterInterview) => void;
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'Phone') return <PhoneIcon className="h-3.5 w-3.5" />;
  if (type === 'Onsite') return <Building2Icon className="h-3.5 w-3.5" />;
  return <VideoIcon className="h-3.5 w-3.5" />;
}

export function RecruiterSchedule({
  interviews,
  loading = false,
  onSchedule,
  onReschedule,
}: RecruiterScheduleProps) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + mondayOffset);

  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const todayIndex = days.findIndex(
    (d) => d.toDateString() === now.toDateString()
  );

  const interviewsByDay = days.map((dayDate) =>
    interviews.filter((interview) => {
      if (!interview.scheduledAt) return false;
      const at = new Date(interview.scheduledAt);
      return at.toDateString() === dayDate.toDateString();
    })
  );

  const upcoming = interviews
    .filter((i) => {
      if (!i.scheduledAt) return true;
      return new Date(i.scheduledAt).getTime() >= now.getTime() - 60 * 60 * 1000;
    })
    .sort((a, b) => {
      const nowMs = now.getTime();
      const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      if (!ta && !tb) return 0;
      if (!ta) return 1;
      if (!tb) return -1;
      const diffA = ta - nowMs;
      const diffB = tb - nowMs;
      if (diffA >= 0 && diffB >= 0) return diffA - diffB;
      if (diffA >= 0 && diffB < 0) return -1;
      if (diffA < 0 && diffB >= 0) return 1;
      return Math.abs(diffA) - Math.abs(diffB);
    });

  const weekLabel = `${days[0].toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${days[4].toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{weekLabel}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Interview schedule
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Book interviews after hiring manager review and keep every
            conversation on the calendar.
          </p>
        </div>
        <Button onClick={onSchedule}>
          <CalendarPlusIcon className="h-4 w-4" /> Schedule interview
        </Button>
      </div>

      <section
        className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
        aria-label="Week calendar"
      >
        <div className="grid grid-cols-5 border-b border-slate-100">
          {days.map((dayDate, index) => (
            <div
              key={dayDate.toISOString()}
              className={`border-r border-slate-100 px-3 py-3 text-center last:border-r-0 ${
                index === todayIndex ? 'bg-brand-50/70' : ''
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {dayDate.toLocaleDateString(undefined, { weekday: 'short' })}
              </p>
              <p
                className={`mt-1 font-display text-lg font-bold ${
                  index === todayIndex ? 'text-brand-700' : 'text-slate-800'
                }`}
              >
                {dayDate.getDate()}
              </p>
            </div>
          ))}
        </div>
        <div className="grid min-h-40 grid-cols-5">
          {days.map((dayDate, index) => (
            <div
              key={dayDate.toISOString()}
              className="border-r border-slate-100 p-2 last:border-r-0"
            >
              {interviewsByDay[index].map((interview) => (
                <button
                  key={interview.id}
                  onClick={() => onReschedule(interview)}
                  className={`mb-2 w-full rounded-lg p-2 text-left text-[10px] font-semibold hover:opacity-90 ${
                    interview.rescheduleRequested
                      ? 'bg-amber-50 text-amber-800'
                      : index % 2 === 0
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-accent-50 text-accent-700'
                  }`}
                >
                  <span className="block truncate">{interview.time}</span>
                  <span className="mt-0.5 block truncate opacity-80">
                    {interview.candidate.split(' ')[0]}
                    {interview.rescheduleRequested ? ' · reschedule' : ''}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">
              Upcoming interviews
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Scheduled conversations for your open roles.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {loading && (
              <p className="p-6 text-sm text-slate-500">Loading interviews…</p>
            )}
            {!loading && upcoming.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No interviews scheduled yet.
                </p>
                <p className="mt-1 text-xs text-slate-450 text-slate-500">
                  After a positive hiring manager review, use Proceed to
                  Interview on a candidate.
                </p>
                <Button className="mt-4" size="sm" onClick={onSchedule}>
                  <CalendarPlusIcon className="h-4 w-4" /> Schedule interview
                </Button>
              </div>
            )}
            {!loading &&
              upcoming.map((interview) => (
                <article
                  key={interview.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={interview.avatar}
                      alt=""
                      className="h-11 w-11 rounded-xl"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {interview.candidate}
                      </p>
                      <p className="text-xs text-slate-500">{interview.role}</p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-sm text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Clock3Icon className="h-4 w-4 text-slate-400" />
                      {interview.time} · {interview.duration}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <TypeIcon type={interview.type} />
                      {interview.type} with {interview.interviewer}
                    </p>
                    {interview.rescheduleReason && (
                      <p className="mt-1 text-xs text-amber-700">
                        HM: {interview.rescheduleReason}
                      </p>
                    )}
                    {interview.meetingLink && (
                      <a
                        href={
                          /^https?:\/\//i.test(interview.meetingLink.trim())
                            ? interview.meetingLink.trim()
                            : `https://${interview.meetingLink.trim()}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                      >
                        <LinkIcon className="h-3.5 w-3.5" /> Join link
                      </a>
                    )}
                    {interview.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {interview.location}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {interview.rescheduleRequested ? (
                      <Badge tone="amber">Needs reschedule</Badge>
                    ) : (
                      <Badge tone="accent">Confirmed</Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => onReschedule(interview)}>
                      Reschedule
                    </Button>
                  </div>
                </article>
              ))}
          </div>
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-lg font-bold">Next step tip</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            When a hiring manager sends a Strong Yes or Yes, schedule the
            interview promptly so the candidate stays engaged.
          </p>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">
              Ready to book?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Pick a reviewed candidate, choose Video / Phone / Onsite, and
              confirm — the candidate is emailed automatically.
            </p>
            <button
              onClick={onSchedule}
              className="mt-3 text-sm font-bold text-brand-600 hover:underline"
            >
              Schedule interview
            </button>
          </div>
        </aside>
      </section>
    </motion.div>
  );
}
