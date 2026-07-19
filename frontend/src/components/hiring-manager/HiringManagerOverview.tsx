import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  UsersRoundIcon } from
'lucide-react';
import type {
  ManagerCandidate,
  ManagerInterview,
  ManagerRole } from
'../../data/hiringManager';
import { DECISION_TONES } from '../../data/hiringManager';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
interface HiringManagerOverviewProps {
  candidates: ManagerCandidate[];
  interviews: ManagerInterview[];
  roles: ManagerRole[];
  onViewChange: (view: 'candidates' | 'feedback' | 'calendar') => void;
  onCandidateSelect: (candidate: ManagerCandidate) => void;
}
export function HiringManagerOverview({
  candidates,
  interviews,
  roles,
  onViewChange,
  onCandidateSelect
}: HiringManagerOverviewProps) {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const awaiting = candidates.filter(
    (candidate) => candidate.decisionStatus === 'Awaiting feedback'
  );
  const submitted = candidates.filter(
    (candidate) => candidate.decisionStatus === 'Feedback submitted'
  );
  const feedbackPct =
    candidates.length === 0
      ? 0
      : Math.round((submitted.length / candidates.length) * 100);
  const nextInterview = interviews[0];
  const nextDetail = nextInterview
    ? `Next: ${nextInterview.time.replace('Today · ', '')}`
    : 'None scheduled';

  const metrics = [
    {
      label: 'Assigned roles',
      value: roles.length,
      detail:
        roles.length === 0
          ? 'No roles assigned yet'
          : `${roles.length} active search${roles.length === 1 ? '' : 'es'}`,
      icon: UsersRoundIcon,
      tone: 'brand',
    },
    {
      label: 'Awaiting your input',
      value: awaiting.length,
      detail:
        awaiting.length === 0
          ? 'Queue is clear'
          : `${awaiting.length} pending review${awaiting.length === 1 ? '' : 's'}`,
      icon: ClipboardCheckIcon,
      tone: 'amber',
    },
    {
      label: 'Upcoming interviews',
      value: interviews.length,
      detail: nextDetail,
      icon: CalendarClockIcon,
      tone: 'accent',
    },
    {
      label: 'Feedback submitted',
      value: submitted.length,
      detail: candidates.length
        ? `${feedbackPct}% of queue complete`
        : 'No candidates yet',
      icon: CheckCircle2Icon,
      tone: 'blue',
    },
  ];
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
      
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Keep the team aligned with clear, timely interview decisions.
          </p>
        </div>
        <Button onClick={() => onViewChange('feedback')}>
          <ClipboardCheckIcon className="h-4 w-4" /> Complete feedback
        </Button>
      </div>

      <section
        aria-label="Hiring manager summary"
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
        {metrics.map(({ label, value, detail, icon: Icon, tone }, index) =>
        <motion.article
          key={label}
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.04
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          
            <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'brand' ? 'bg-brand-50 text-brand-600' : tone === 'accent' ? 'bg-accent-50 text-accent-600' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
            
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </motion.article>
        )}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          aria-labelledby="decision-queue-title">
          
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div>
              <h2
                id="decision-queue-title"
                className="font-display text-lg font-bold">
                
                Decision queue
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Evidence keeps the next step clear for every candidate.
              </p>
            </div>
            <button
              onClick={() => onViewChange('candidates')}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
              All candidates <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {awaiting.map((candidate) =>
            <button
              key={candidate.id}
              onClick={() => onCandidateSelect(candidate)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-6">
              
                <img
                src={candidate.avatar}
                alt=""
                className="h-11 w-11 rounded-xl" />
              
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">
                    {candidate.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {candidate.role} ·{' '}
                    {candidate.interviewTime ?? candidate.applied}
                  </span>
                </span>
                <Badge tone={DECISION_TONES[candidate.decisionStatus]}>
                  {candidate.decisionStatus}
                </Badge>
              </button>
            )}
            {!awaiting.length &&
            <p className="px-6 py-10 text-center text-sm text-slate-500">
                Your decision queue is clear.
              </p>
            }
          </div>
        </section>

        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="interviews-title">
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="interviews-title"
                className="font-display text-lg font-bold">
                
                Up next
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your manager interviews this week.
              </p>
            </div>
            <button
              onClick={() => onViewChange('calendar')}
              className="text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
              Calendar
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {interviews.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">
                No interviews scheduled for your roles yet.
              </p>
            )}
            {interviews.slice(0, 2).map((interview) =>
            <button
              key={interview.id}
              onClick={() => onViewChange('calendar')}
              className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
                <img
                src={interview.avatar}
                alt=""
                className="h-10 w-10 rounded-xl" />
              
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">
                    {interview.candidate}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {interview.focus}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-xs font-bold text-brand-700">
                    {interview.time.replace('Today · ', '')}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">
                    {interview.duration}
                  </span>
                </span>
              </button>
            )}
          </div>
          <button
            onClick={() => onViewChange('calendar')}
            className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            
            View calendar
          </button>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="roles-title">
          
          <div className="flex items-start justify-between">
            <div>
              <h2 id="roles-title" className="font-display text-lg font-bold">
                Assigned roles
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your decision ownership across active searches.
              </p>
            </div>
            <Badge tone="slate">{roles.length} roles</Badge>
          </div>
          <div className="mt-5 space-y-4">
            {roles.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">
                Roles appear here once candidates are shortlisted to your
                departments.
              </p>
            )}
            {roles.map((role) =>
            <article
              key={role.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {role.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {role.team} · {role.openSeats} open{' '}
                    {role.openSeats === 1 ? 'seat' : 'seats'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={role.awaitingDecisions ? 'amber' : 'accent'}>
                    {role.stage}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    {role.awaitingDecisions} awaiting
                  </span>
                </div>
              </article>
            )}
          </div>
        </section>

        <aside
          className="rounded-2xl border border-accent-100 bg-accent-50/60 p-5 shadow-soft sm:p-6"
          aria-labelledby="pulse-title">
          
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white">
            <UsersRoundIcon className="h-5 w-5" />
          </span>
          <h2 id="pulse-title" className="mt-5 font-display text-lg font-bold">
            Team decision pulse
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {awaiting.length > 0
              ? `${awaiting.length} candidate${awaiting.length === 1 ? '' : 's'} still need your recommendation before the recruiter can schedule interviews.`
              : candidates.length > 0
                ? 'All shortlisted candidates have feedback. Great pace — keep the loop moving.'
                : 'When recruiters shortlist candidates for your teams, they will appear here for review.'}
          </p>
          <div className="mt-5 rounded-xl border border-accent-100 bg-white/80 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Feedback completion
            </p>
            <div className="mt-3 flex items-end gap-4">
              <p className="font-display text-3xl font-extrabold text-slate-900">
                {feedbackPct}%
              </p>
              <p className="pb-1 text-xs text-slate-500">
                of assigned feedback complete
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feedbackPct}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-accent-500"
              />
            </div>
          </div>
          <button
            onClick={() => onViewChange('feedback')}
            className="mt-5 text-sm font-bold text-accent-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            
            Add interview evidence
          </button>
        </aside>
      </div>
    </motion.div>);

}