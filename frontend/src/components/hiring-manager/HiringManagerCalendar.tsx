import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClockIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ExternalLinkIcon,
  LightbulbIcon,
  VideoIcon } from
'lucide-react';
import type { ManagerInterview } from '../../data/hiringManager';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
interface HiringManagerCalendarProps {
  interviews: ManagerInterview[];
  onOpenFeedback: (candidateId: string) => void;
}
export function HiringManagerCalendar({
  interviews,
  onOpenFeedback
}: HiringManagerCalendarProps) {
  const [message, setMessage] = useState('');
  const showMessage = (next: string) => {
    setMessage(next);
    window.setTimeout(() => setMessage(''), 2600);
  };
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
      className="mx-auto max-w-[1280px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">May 13–17</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Interview calendar
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Prepare for each conversation and close the feedback loop quickly.
          </p>
        </div>
        <Badge tone="accent">
          <CalendarClockIcon className="h-3.5 w-3.5" /> {interviews.length}{' '}
          upcoming
        </Badge>
      </div>
      {message &&
      <div
        role="status"
        className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        
          <CheckCircle2Icon className="h-4 w-4" />
          {message}
        </div>
      }
      <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          aria-labelledby="upcoming-interviews-title">
          
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2
              id="upcoming-interviews-title"
              className="font-display text-lg font-bold">
              
              Upcoming interviews
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your assigned conversations and their preparation notes.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {interviews.map((interview) =>
            <article key={interview.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <img
                  src={interview.avatar}
                  alt=""
                  className="h-12 w-12 rounded-xl" />
                
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-800">
                        {interview.candidate}
                      </h3>
                      <Badge tone="brand">{interview.role}</Badge>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Clock3Icon className="h-4 w-4 text-slate-400" />
                      {interview.time} · {interview.duration}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <VideoIcon className="h-3.5 w-3.5" />
                      {interview.format}
                    </p>
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
                    <Button
                    size="sm"
                    onClick={() =>
                    showMessage(
                      `Meeting opened for ${interview.candidate}.`
                    )
                    }>
                    
                      <ExternalLinkIcon className="h-4 w-4" /> Join
                    </Button>
                    <button
                    onClick={() =>
                    showMessage(
                      `Reschedule request started for ${interview.candidate}.`
                    )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    
                      Reschedule
                    </button>
                  </div>
                </div>
                <button
                onClick={() => onOpenFeedback(interview.candidateId)}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                
                  Complete feedback <CheckCircle2Icon className="h-4 w-4" />
                </button>
              </article>
            )}
          </div>
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 shadow-soft sm:p-6">
            <LightbulbIcon className="h-5 w-5 text-brand-600" />
            <h2 className="mt-3 font-display text-lg font-bold">
              A better debrief
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Capture evidence independently before opening the team discussion.
              It helps every voice stay specific and reduces recency bias.
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-lg font-bold">
              Your availability
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pacific Time · 9:00 AM–4:30 PM
            </p>
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">
                2 blocks open this week
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Recruiting uses your shared availability when proposing
                interview times.
              </p>
            </div>
            <button
              onClick={() =>
              showMessage('Availability preferences are ready to update.')
              }
              className="mt-5 text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
              Manage availability
            </button>
          </section>
        </aside>
      </div>
    </motion.div>);

}