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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      {/* 5-Day Header Controls */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              5-Day Calendar Grid ({startDateStr} – {endDateStr}, {yearStr})
            </h2>
            <p className="text-xs text-slate-500">
              Work week schedule (Monday – Friday)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToThisWeek} className="text-xs font-medium">
            This Week
          </Button>
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={prev5Days}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition"
              title="Previous 5 Days"
            >
              <ChevronLeftIcon className="h-4 w-4" /> Prev 5 Days
            </button>
            <div className="h-4 w-px bg-slate-200 my-auto" />
            <button
              onClick={next5Days}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition"
              title="Next 5 Days"
            >
              Next 5 Days <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Columns Grid (Mon - Fri) */}
      <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[220px]">
        {workDays.map((day) => {
          const dayInterviews = interviewsByDate[day.dateKey] || [];
          return (
            <div
              key={day.dateKey}
              className={`flex flex-col p-3 transition ${
                day.isToday ? 'bg-brand-50/20' : 'bg-white'
              }`}
            >
              {/* Day Header */}
              <div
                className={`flex items-center justify-between rounded-xl p-2 mb-2.5 border ${
                  day.isToday
                    ? 'border-brand-200 bg-brand-600 text-white shadow-sm'
                    : 'border-slate-200/80 bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      day.isToday ? 'text-brand-100' : 'text-slate-500'
                    }`}
                  >
                    {day.shortDayName}
                  </p>
                  <p className="font-display text-xs font-bold">{day.displayDate}</p>
                </div>
                {dayInterviews.length > 0 && (
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold ${
                      day.isToday ? 'bg-white text-brand-700' : 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    {dayInterviews.length}
                  </span>
                )}
              </div>

              {/* Compact Name & Time Pills inside Grid Cell */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-0.5">
                {dayInterviews.length === 0 ? (
                  <div className="flex h-20 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/80 p-2 text-center">
                    <p className="text-[11px] text-slate-400 font-medium">No interviews</p>
                  </div>
                ) : (
                  dayInterviews.map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() => setSelectedInterview(interview)}
                      className="group w-full text-left rounded-xl border border-brand-200/80 bg-brand-50/70 p-2.5 transition hover:bg-brand-100/80 hover:border-brand-300 shadow-2xs focus-visible:outline-none"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-bold text-slate-900 group-hover:text-brand-900">
                          {interview.candidate}
                        </p>
                        {interview.isSyncedToGoogleCalendar && (
                          <span title="Synced to Google Calendar" className="shrink-0 text-[10px] font-extrabold text-emerald-600">
                            G✓
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedInterview.avatar}
                    alt={selectedInterview.candidate}
                    className="h-12 w-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {selectedInterview.candidate}
                    </h3>
                    <p className="text-xs font-medium text-slate-500">{selectedInterview.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInterview(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock3Icon className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold text-slate-900">Scheduled:</span> {selectedInterview.time} ({selectedInterview.duration})
                </div>
                <div className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold text-slate-900">Format:</span> {selectedInterview.format}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Preparation Focus:</span>
                  <p className="mt-1 text-slate-600">{selectedInterview.focus}</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  {selectedInterview.isSyncedToGoogleCalendar && selectedInterview.googleCalendarHtmlLink ? (
                    <a
                      href={selectedInterview.googleCalendarHtmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <CalendarDaysIcon className="h-3.5 w-3.5 text-brand-600" />
                      Open in Google Calendar ↗
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSyncSingleInterview(selectedInterview)}
                      className="text-xs"
                    >
                      <CalendarDaysIcon className="h-3.5 w-3.5 text-brand-600" />
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
                    className="text-xs"
                  >
                    <RotateCwIcon className="h-3.5 w-3.5 text-amber-600" />
                    Reschedule
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedInterview(null);
                      onOpenFeedback(selectedInterview);
                    }}
                    className="text-xs"
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
