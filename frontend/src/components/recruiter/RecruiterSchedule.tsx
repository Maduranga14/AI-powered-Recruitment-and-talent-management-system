import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarPlusIcon,
  Clock3Icon,
  LinkIcon,
  MapPinIcon,
  VideoIcon } from
'lucide-react';
import type { RecruiterInterview } from '../../data/recruiter';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
interface RecruiterScheduleProps {
  interviews: RecruiterInterview[];
  onSchedule: () => void;
}
export function RecruiterSchedule({
  interviews,
  onSchedule
}: RecruiterScheduleProps) {
  const days = ['Mon 13', 'Tue 14', 'Wed 15', 'Thu 16', 'Fri 17'];
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">May 13–17</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Interview schedule
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Coordinate high-signal conversations without losing the hiring
            thread.
          </p>
        </div>
        <Button onClick={onSchedule}>
          <CalendarPlusIcon className="h-4 w-4" /> Schedule interview
        </Button>
      </div>
      <section
        className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
        aria-label="Week calendar">
        
        <div className="grid grid-cols-5 border-b border-slate-100">
          {days.map((day, index) =>
          <div
            key={day}
            className={`border-r border-slate-100 px-3 py-3 text-center last:border-r-0 ${index === 1 ? 'bg-brand-50/70' : ''}`}>
            
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {day.slice(0, 3)}
              </p>
              <p
              className={`mt-1 font-display text-lg font-bold ${index === 1 ? 'text-brand-700' : 'text-slate-800'}`}>
              
                {day.slice(4)}
              </p>
            </div>
          )}
        </div>
        <div className="grid min-h-40 grid-cols-5">
          {days.map((day, index) =>
          <div
            key={day}
            className="border-r border-slate-100 p-2 last:border-r-0">
            
              {index === 1 &&
            interviews.slice(0, 2).map((interview) =>
            <button
              key={interview.id}
              onClick={onSchedule}
              className="mb-2 w-full rounded-lg bg-brand-50 p-2 text-left text-[10px] font-semibold text-brand-700 hover:bg-brand-100">
              
                    <span className="block truncate">
                      {interview.time.replace('Today · ', '')}
                    </span>
                    <span className="mt-0.5 block truncate text-brand-600">
                      {interview.candidate.split(' ')[0]}
                    </span>
                  </button>
            )}
              {index === 3 &&
            interviews.slice(2).map((interview) =>
            <button
              key={interview.id}
              onClick={onSchedule}
              className="mb-2 w-full rounded-lg bg-accent-50 p-2 text-left text-[10px] font-semibold text-accent-700 hover:bg-accent-100">
              
                    <span className="block truncate">
                      {interview.time.split('· ')[1]}
                    </span>
                    <span className="mt-0.5 block truncate text-accent-700">
                      {interview.candidate.split(' ')[0]}
                    </span>
                  </button>
            )}
            </div>
          )}
        </div>
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">
              Upcoming interviews
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your next scheduled conversations.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {interviews.map((interview) =>
            <article
              key={interview.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              
                <div className="flex items-center gap-3">
                  <img
                  src={interview.avatar}
                  alt=""
                  className="h-11 w-11 rounded-xl" />
                
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
                    <VideoIcon className="h-3.5 w-3.5" />
                    {interview.type} with {interview.interviewer}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="accent">Confirmed</Badge>
                  <button
                  onClick={onSchedule}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  aria-label={`Reschedule ${interview.candidate}`}>
                  
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>
              </article>
            )}
          </div>
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-lg font-bold">Scheduling tip</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The fastest teams book the next step before the current interview
            ends. Offer a shared availability link to remove back-and-forth.
          </p>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">
              Recruiting team availability
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPinIcon className="h-3.5 w-3.5" />
              Pacific Time · Updated today
            </p>
            <button
              onClick={onSchedule}
              className="mt-3 text-sm font-bold text-brand-600 hover:underline">
              
              Manage availability
            </button>
          </div>
        </aside>
      </section>
    </motion.div>);

}