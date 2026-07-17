import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRightIcon,
  BookmarkIcon,
  BriefcaseBusinessIcon,
  Clock3Icon,
  MapPinIcon,
  SparklesIcon } from
'lucide-react';
import type { Job } from '../data/jobs';
import { formatSalary } from '../data/jobs';
import { Badge } from './ui/Badge';
import { MatchScore } from './ui/MatchScore';
import { useAuth } from '../context/AuthContext';
interface JobCardProps {
  job: Job;
  showMatch?: boolean;
}
export function JobCard({ job, showMatch = false }: JobCardProps) {
  const { savedJobs, toggleSaveJob, isAuthenticated } = useAuth();
  const saved = savedJobs.includes(job.id);
  const isNew = job.postedDaysAgo <= 2;
  const topLabel = job.featured ?
  'Featured role' :
  isNew ?
  'New opportunity' :
  `${job.postedDaysAgo} days ago`;
  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 12
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.3
      }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {(job.featured || isNew) &&
          <SparklesIcon className="h-3.5 w-3.5 text-brand-500" />
          }
          {topLabel}
        </span>
        {showMatch &&
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-100">
            <SparklesIcon className="h-3.5 w-3.5" /> AI matched
          </span>
        }
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
            <img
              src={job.companyLogo}
              alt={`${job.company} logo`}
              className="h-full w-full rounded-xl object-cover" />
            
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-semibold text-slate-500">
              {job.company}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold leading-snug text-slate-900 sm:text-xl">
              <Link
                to={`/jobs/${job.id}`}
                className="rounded-sm outline-none transition-colors hover:text-brand-600 focus-visible:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                
                {job.title}
              </Link>
            </h3>
          </div>
          {showMatch &&
          <div
            className="flex-shrink-0"
            aria-label={`${job.matchScore}% AI match`}>
            
              <MatchScore score={job.matchScore} size={52} />
            </div>
          }
        </div>

        <p className="mt-5 line-clamp-3 min-h-[3.75rem] text-sm leading-6 text-slate-600">
          {job.shortDescription}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-100 py-4 text-xs">
          <div className="flex min-w-0 items-center gap-1.5 text-slate-600">
            <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <dt className="sr-only">Location</dt>
            <dd className="truncate font-medium">{job.location}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-slate-600">
            <BriefcaseBusinessIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <dt className="sr-only">Employment type</dt>
            <dd className="truncate font-medium">{job.type}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-slate-600">
            <Clock3Icon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <dt className="sr-only">Posted</dt>
            <dd className="font-medium">
              {job.postedDaysAgo === 1 ?
              'Posted today' :
              `${job.postedDaysAgo}d ago`}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="sr-only">Work mode</dt>
            <dd>
              <Badge tone="accent" className="max-w-full truncate">
                {job.workMode}
              </Badge>
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="slate">{job.level}</Badge>
          {job.skills.slice(0, 2).map((skill) =>
          <Badge key={skill} tone="brand">
              {skill}
            </Badge>
          )}
          {job.skills.length > 2 &&
          <Badge tone="slate">+{job.skills.length - 2}</Badge>
          }
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Estimated salary
            </p>
            <p className={`mt-1 font-display text-lg font-bold ${job.salaryMin <= 0 && job.salaryMax <= 0 ? 'text-slate-400' : 'text-slate-900'}`}>
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSaveJob(job.id)}
              disabled={!isAuthenticated}
              title={
              isAuthenticated ?
              saved ?
              'Remove saved job' :
              'Save job' :
              'Sign in to save'
              }
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={saved ? 'Remove saved job' : 'Save job'}
              aria-pressed={saved}>
              
              <BookmarkIcon
                className={`h-[18px] w-[18px] ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
              
            </button>
            <Link
              to={`/jobs/${job.id}`}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
              
              <span className="hidden sm:inline">View role</span>
              <span className="sm:hidden">View</span>
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>);

}