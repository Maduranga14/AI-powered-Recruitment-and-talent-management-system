import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoIcon,
  Clock3Icon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  RotateCwIcon,
  XIcon,
  CalendarIcon,
} from 'lucide-react';
import type { ManagerInterview } from '../../data/hiringManager';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CalendarGridViewProps {
  interviews: ManagerInterview[];
  onSyncSingleInterview: (interview: ManagerInterview) => void;
  syncingInterviewId: string | null;
  onRequestReschedule: (interview: ManagerInterview) => void;
  onOpenFeedback: (interview: ManagerInterview) => void;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CalendarGridView({
  interviews,
  onSyncSingleInterview,
  syncingInterviewId,
  onRequestReschedule,
  onOpenFeedback,
}: CalendarGridViewProps) {
  const [mondayDate, setMondayDate] = useState<Date>(() => {
    const firstInterview = interviews.find((i) => i.scheduledAt);
    if (firstInterview?.scheduledAt) {
      const d = new Date(firstInterview.scheduledAt);
      if (!isNaN(d.getTime())) return getMonday(d);
    }
    return getMonday(new Date());
  });

  const [selectedInterview, setSelectedInterview] = useState<ManagerInterview | null>(null);

  const workDays: {
    date: Date;
    dayName: string;
    shortDayName: string;
    dateKey: string;
    isToday: boolean;
    displayDate: string;
  }[] = [];

  const todayKey = formatDateKey(new Date());
  const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayNamesFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  for (let i = 0; i < 5; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const dateKey = formatDateKey(d);
    const isToday = dateKey === todayKey;
    const displayDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    workDays.push({
      date: d,
      dayName: dayNamesFull[i],
      shortDayName: dayNamesShort[i],
      dateKey,
      isToday,
      displayDate,
    });
  }

  const startDateStr = workDays[0].displayDate;
  const endDateStr = workDays[4].displayDate;
  const yearStr = workDays[0].date.getFullYear();

  const prev5Days = () => {
    const prevMon = new Date(mondayDate);
    prevMon.setDate(mondayDate.getDate() - 7);
    setMondayDate(prevMon);
  };

  const next5Days = () => {
    const nextMon = new Date(mondayDate);
    nextMon.setDate(mondayDate.getDate() + 7);
    setMondayDate(nextMon);
  };

  const goToThisWeek = () => {
    setMondayDate(getMonday(new Date()));
  };

  const interviewsByDate: Record<string, ManagerInterview[]> = {};

  interviews.forEach((interview) => {
    let key = '';
    if (interview.scheduledAt) {
      const d = new Date(interview.scheduledAt);
      if (!isNaN(d.getTime())) {
        key = formatDateKey(d);
      }
    }
    if (!key) {
      key = todayKey;
    }

    if (!interviewsByDate[key]) {
      interviewsByDate[key] = [];
    }
    interviewsByDate[key].push(interview);
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 text-white shadow-xl">
      {/* 5-Day Header Controls */}
      <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/20 text-teal-300">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold text-white">
              5-Day Calendar Grid ({startDateStr} – {endDateStr}, {yearStr})
            </h2>
            <p className="text-xs text-slate-400">
              Work week schedule (Monday – Friday)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToThisWeek} className="text-xs font-bold border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
            This Week
          </Button>
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 p-0.5">
            <button
              onClick={prev5Days}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Previous 5 Days"
            >
              <ChevronLeftIcon className="h-4 w-4" /> Prev 5 Days
            </button>
            <div className="h-4 w-px bg-slate-700 my-auto" />
            <button
              onClick={next5Days}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Next 5 Days"
            >
              Next 5 Days <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Columns Grid (Mon - Fri) */}
      <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800 min-h-[220px]">
        {workDays.map((day) => {
          const dayInterviews = interviewsByDate[day.dateKey] || [];
          return (
            <div
              key={day.dateKey}
              className={`flex flex-col p-3 transition ${
                day.isToday ? 'bg-brand-500/10' : 'bg-slate-900/40'
              }`}
            >
              {/* Day Header */}
              <div
                className={`flex items-center justify-between rounded-xl p-2 mb-2.5 border ${
                  day.isToday
                    ? 'border-teal-400 bg-brand-600 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950 text-slate-200'
                }`}
              >
                <div>
                  <p
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      day.isToday ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    {day.shortDayName}
                  </p>
                  <p className="font-display text-xs font-extrabold">{day.displayDate}</p>
                </div>
                {dayInterviews.length > 0 && (
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold ${
                      day.isToday ? 'bg-white text-brand-700' : 'bg-brand-500/20 text-teal-300 border border-brand-500/30'
                    }`}
                  >
                    {dayInterviews.length}
                  </span>
                )}
              </div>

              {/* Compact Name & Time Pills inside Grid Cell */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-0.5">
                {dayInterviews.length === 0 ? (
                  <div className="flex h-20 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-2 text-center">
                    <p className="text-[11px] text-slate-500 font-medium">No interviews</p>
                  </div>
                ) : (
                  dayInterviews.map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() => setSelectedInterview(interview)}
                      className="group w-full text-left rounded-xl border border-slate-700 bg-slate-800 p-2.5 transition hover:bg-slate-700 hover:border-teal-400/50 shadow-sm focus-visible:outline-none"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-bold text-white group-hover:text-teal-300">
                          {interview.candidate}
                        </p>
                        {interview.isSyncedToGoogleCalendar && (
                          <span title="Synced to Google Calendar" className="shrink-0 text-[10px] font-extrabold text-teal-400">
                            G✓
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-300">
                        <Clock3Icon className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{interview.time}</span>
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Interview Details Modal Popover */}
      <AnimatePresence>
        {selectedInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedInterview.avatar}
                    alt={selectedInterview.candidate}
                    className="h-12 w-12 rounded-full object-cover border border-slate-700 bg-slate-950"
                  />
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-white">
                      {selectedInterview.candidate}
                    </h3>
                    <p className="text-xs font-medium text-slate-400">{selectedInterview.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInterview(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-white">
                <div className="flex items-center gap-2">
                  <Clock3Icon className="h-4 w-4 text-slate-400" />
                  <span className="font-bold text-white">Scheduled:</span> {selectedInterview.time} ({selectedInterview.duration})
                </div>
                <div className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4 text-slate-400" />
                  <span className="font-bold text-white">Format:</span> {selectedInterview.format}
                </div>
                <div>
                  <span className="font-bold text-white">Preparation Focus:</span>
                  <p className="mt-1 text-slate-300">{selectedInterview.focus}</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  {selectedInterview.isSyncedToGoogleCalendar && selectedInterview.googleCalendarHtmlLink ? (
                    <a
                      href={selectedInterview.googleCalendarHtmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
                    >
                      <CalendarDaysIcon className="h-3.5 w-3.5 text-teal-400" />
                      Open in Google Calendar ↗
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSyncSingleInterview(selectedInterview)}
                      className="text-xs border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                    >
                      <CalendarDaysIcon className="h-3.5 w-3.5 text-teal-400" />
                      Add to Google Calendar
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInterview(null);
                      onRequestReschedule(selectedInterview);
                    }}
                    className="text-xs border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                  >
                    <RotateCwIcon className="h-3.5 w-3.5 text-amber-400" />
                    Reschedule
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedInterview(null);
                      onOpenFeedback(selectedInterview);
                    }}
                    className="text-xs bg-brand-600 hover:bg-brand-500 text-white font-bold"
                  >
                    <CheckCircle2Icon className="h-3.5 w-3.5" />
                    Submit Feedback
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

