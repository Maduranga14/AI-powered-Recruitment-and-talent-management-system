import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CalendarClockIcon,
  Clock3Icon,
  SparklesIcon,
  TrendingUpIcon,
  UsersRoundIcon } from
'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScore } from '../ui/MatchScore';
import type {
  RecruiterCandidate,
  RecruiterInterview,
  RecruiterJob } from
'../../data/recruiter';
interface RecruiterOverviewProps {
  candidates: RecruiterCandidate[];
  jobs: RecruiterJob[];
  interviews: RecruiterInterview[];
  onViewChange: (view: 'jobs' | 'candidates' | 'schedule' | 'inbox') => void;
  onCandidateSelect: (candidate: RecruiterCandidate) => void;
}
const metrics = [
{
  label: 'Active openings',
  value: '4',
  change: '+1 this month',
  icon: TrendingUpIcon,
  tone: 'brand'
},
{
  label: 'Total applicants',
  value: '246',
  change: '+18% this week',
  icon: UsersRoundIcon,
  tone: 'accent'
},
{
  label: 'In interview',
  value: '14',
  change: '4 scheduled today',
  icon: CalendarClockIcon,
  tone: 'amber'
},
{
  label: 'Avg. time to hire',
  value: '18d',
  change: '3 days faster',
  icon: Clock3Icon,
  tone: 'blue'
}];

export function RecruiterOverview({
  candidates,
  jobs,
  interviews,
  onViewChange,
  onCandidateSelect
}: RecruiterOverviewProps) {
  const activities = candidates.
  filter((candidate) => candidate.stage !== 'Rejected').
  slice(0, 4);
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
          <p className="text-sm font-medium text-slate-500">Tuesday, May 14</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Good morning, Olivia
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Here’s where your hiring momentum stands today.
          </p>
        </div>
        <Button onClick={() => onViewChange('candidates')}>
          <SparklesIcon className="h-4 w-4" /> Review top matches
        </Button>
      </div>

      <section
        aria-label="Recruiting key performance indicators"
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
        {metrics.map(({ label, value, change, icon: Icon, tone }, index) =>
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
          
            <div className="flex items-start justify-between">
              <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'brand' ? 'bg-brand-50 text-brand-600' : tone === 'accent' ? 'bg-accent-50 text-accent-600' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                {change}
              </span>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-slate-900">
              {value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </motion.article>
        )}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="role-health-title">
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="role-health-title"
                className="font-display text-lg font-bold">
                
                Role health
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pipeline strength across your active searches.
              </p>
            </div>
            <button
              onClick={() => onViewChange('jobs')}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand-600 hover:underline">
              
              View jobs <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 space-y-5">
            {jobs.
            filter((job) => job.status === 'Active').
            slice(0, 3).
            map((job) => {
              const progress = Math.round(
                job.interviews / Math.max(job.target * 4, 1) * 100
              );
              return (
                <div key={job.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {job.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {job.applicants} applicants · {job.shortlisted}{' '}
                          shortlisted
                        </p>
                      </div>
                      <Badge tone={job.interviews >= 3 ? 'accent' : 'amber'}>
                        {job.interviews >= 3 ? 'On track' : 'Needs attention'}
                      </Badge>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                      initial={{
                        width: 0
                      }}
                      animate={{
                        width: `${Math.min(progress, 100)}%`
                      }}
                      transition={{
                        duration: 0.5
                      }}
                      className={
                      job.interviews >= 3 ?
                      'h-full rounded-full bg-accent-500' :
                      'h-full rounded-full bg-amber-400'
                      } />
                    
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
                      <span>{job.screened} screened</span>
                      <span>
                        {job.interviews} / {job.target * 4} interview target
                      </span>
                    </div>
                  </div>);

            })}
          </div>
        </section>

        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="today-title">
          
          <div className="flex items-start justify-between">
            <div>
              <h2 id="today-title" className="font-display text-lg font-bold">
                Today’s interviews
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                2 conversations on deck.
              </p>
            </div>
            <button
              onClick={() => onViewChange('schedule')}
              className="text-sm font-bold text-brand-600 hover:underline">
              
              Calendar
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {interviews.slice(0, 2).map((interview) =>
            <button
              key={interview.id}
              onClick={() => onViewChange('schedule')}
              className="flex w-full items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
                <img
                src={interview.avatar}
                alt=""
                className="h-10 w-10 rounded-xl" />
              
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {interview.candidate}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {interview.role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-brand-700">
                    {interview.time.replace('Today · ', '')}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {interview.duration}
                  </p>
                </div>
              </button>
            )}
          </div>
          <button
            onClick={() => onViewChange('schedule')}
            className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            
            View full schedule
          </button>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          aria-labelledby="activity-title">
          
          <div className="flex items-center justify-between p-5 sm:p-6">
            <div>
              <h2
                id="activity-title"
                className="font-display text-lg font-bold">
                
                Candidate activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Recent applications and stage movement.
              </p>
            </div>
            <button
              onClick={() => onViewChange('candidates')}
              className="text-sm font-bold text-brand-600 hover:underline">
              
              All candidates
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.map((candidate) =>
            <button
              key={candidate.id}
              onClick={() => onCandidateSelect(candidate)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 sm:px-6">
              
                <img
                src={candidate.avatar}
                alt=""
                className="h-9 w-9 rounded-xl" />
              
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {candidate.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Applied for {candidate.role} · {candidate.applied}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <Badge
                  tone={
                  candidate.stage === 'Interview' ?
                  'accent' :
                  candidate.stage === 'Shortlisted' ?
                  'brand' :
                  'amber'
                  }>
                  
                    {candidate.stage}
                  </Badge>
                </div>
                <div className="hidden md:block">
                  <MatchScore score={candidate.matchScore} size={38} />
                </div>
              </button>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 shadow-soft sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-5 font-display text-lg font-bold">
            AI pipeline signal
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Six candidates exceed an 85% match across active roles. The Frontend
            Engineer search has the strongest ready-to-interview bench.
          </p>
          <div className="mt-5 rounded-xl border border-brand-100 bg-white/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Highest-fit search
              </span>
              <Badge tone="accent">96% top match</Badge>
            </div>
            <p className="mt-2 font-display font-bold text-slate-900">
              Senior Frontend Engineer
            </p>
            <button
              onClick={() => onViewChange('candidates')}
              className="mt-3 text-sm font-bold text-brand-600 hover:underline">
              
              Review recommended talent
            </button>
          </div>
        </section>
      </div>
    </motion.div>);

}