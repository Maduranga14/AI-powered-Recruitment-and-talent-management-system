import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  MoreHorizontalIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  PlusIcon,
  UsersRoundIcon } from
'lucide-react';
import type { RecruiterJob } from '../../data/recruiter';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
interface RecruiterJobsProps {
  jobs: RecruiterJob[];
  loading?: boolean;
  onCreateJob: () => void;
  onSchedule: () => void;
  onStatusChange: (jobId: string) => void;
  onViewApplicants: (jobId: string) => void;
  onEditJob: (job: RecruiterJob) => void;
  onDeleteJob: (jobId: string) => void;
}
export function RecruiterJobs({
  jobs,
  loading,
  onCreateJob,
  onSchedule,
  onStatusChange,
  onViewApplicants,
  onEditJob,
  onDeleteJob
}: RecruiterJobsProps) {
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);
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
          <p className="text-sm font-medium text-slate-500">Hiring plan · Q2</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Jobs
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor pipeline activity and prioritize the searches that need
            attention.
          </p>
        </div>
        <Button onClick={onCreateJob}>
          <PlusIcon className="h-4 w-4" /> Create job
        </Button>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-slate-500">Active roles</p>
          <p className="mt-2 font-display text-3xl font-extrabold">
            {jobs.filter((job) => job.status === 'Active').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-slate-500">
            Candidates in pipeline
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold">
            {jobs.reduce((total, job) => total + job.applicants, 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-slate-500">
            Interviews this week
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold">14</p>
        </div>
      </div>
      <section
        className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
        aria-labelledby="open-roles-title">
        
        <div className="flex items-center justify-between p-5 sm:p-6">
          <div>
            <h2
              id="open-roles-title"
              className="font-display text-lg font-bold">
              
              Your openings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pipeline progress at a glance.
            </p>
          </div>
          <Badge tone="slate">{jobs.length} roles</Badge>
        </div>
        <div className="divide-y divide-slate-100">
          {jobs.map((job) => {
            const pipeline = job.applicants ?
            Math.round(
              (job.screened + job.shortlisted + job.interviews) / (
              job.applicants * 1.55) *
              100
            ) :
            0;
            return (
              <article key={job.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {job.title}
                      </h3>
                      <Badge tone={job.status === 'Active' ? 'green' : 'slate'}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {job.team} · {job.location} · {job.posted}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-5 text-center sm:w-72">
                    <div>
                      <p className="font-display text-lg font-extrabold">
                        {job.applicants}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        Applicants
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-lg font-extrabold">
                        {job.shortlisted}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        Shortlisted
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-lg font-extrabold">
                        {job.interviews}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">
                        Interviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative">
                    <button
                      onClick={() => setActiveMenuJobId(activeMenuJobId === job.id ? null : job.id)}
                      aria-label={`More actions for ${job.title}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                      
                      <MoreHorizontalIcon className="h-5 w-5" />
                    </button>
                    {activeMenuJobId === job.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveMenuJobId(null)}
                        />
                        <div className="absolute right-0 top-12 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                          <button
                            onClick={() => {
                              setActiveMenuJobId(null);
                              onEditJob(job);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit Job
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuJobId(null);
                              onDeleteJob(job.id);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete Job
                          </button>
                        </div>
                      </>
                    )}
                    <button
                      onClick={onSchedule}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-brand-600">
                      
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Schedule</span>
                    </button>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Pipeline health</span>
                      <span>{pipeline}% progressed</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{
                          width: 0
                        }}
                        animate={{
                          width: `${pipeline}%`
                        }}
                        transition={{
                          duration: 0.5
                        }}
                        className="h-full rounded-full bg-brand-600" />
                      
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <UsersRoundIcon className="h-4 w-4 text-slate-400" />{' '}
                    {job.screened} screened{' '}
                    <span className="mx-1 text-slate-300">·</span> {job.target}{' '}
                    hire target
                  </div>
                </div>
                <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => onStatusChange(job.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline">
                    
                    {job.status === 'Active' ?
                    <PauseCircleIcon className="h-4 w-4" /> :

                    <PlayCircleIcon className="h-4 w-4" />
                    }
                    {job.status === 'Active' ? 'Pause job' : 'Resume job'}
                  </button>
                  <button
                    onClick={() => onViewApplicants(job.id)}
                    className="text-sm font-bold text-slate-600 hover:underline">
                    
                    View applicants
                  </button>
                </div>
              </article>);

          })}
        </div>
      </section>
    </motion.div>);

}