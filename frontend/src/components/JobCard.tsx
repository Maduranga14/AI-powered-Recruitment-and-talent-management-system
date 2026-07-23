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
  const { isSaved, toggleSaveJob, isAuthenticated, user } = useAuth();
  const saved = isSaved(job.id);
  const role = (user?.title ?? '').toLowerCase();
  const hideCandidateActions =
    role === 'admin' || role === 'recruiter' || role === 'hiringmanager';
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
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-2xl text-white">
      
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-5 py-3 sm:px-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {(job.featured || isNew) &&
          <SparklesIcon className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
          }
          {topLabel}
        </span>
        {showMatch &&
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-2.5 py-1 text-[11px] font-bold text-teal-300 ring-1 ring-inset ring-brand-500/30">
            <SparklesIcon className="h-3.5 w-3.5 text-teal-300" /> AI matched
          </span>
        }
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-800 p-1.5 shadow-sm ring-1 ring-slate-700">
            <img
              src={job.companyLogo}
              alt={`${job.company} logo`}
              className="h-full w-full rounded-xl object-cover" />
            
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-semibold text-slate-400">
              {job.company}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold leading-snug text-white sm:text-xl">
              <Link
                to={`/jobs/${job.id}`}
                className="rounded-sm outline-none transition-colors hover:text-teal-300 focus-visible:text-teal-300 focus-visible:ring-2 focus-visible:ring-brand-500">
                
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

        <p className="mt-5 line-clamp-3 min-h-[3.75rem] text-sm leading-6 text-slate-300">
          {job.shortDescription}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-800 py-4 text-xs">
          <div className="flex min-w-0 items-center gap-1.5 text-slate-300">
            <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <dt className="sr-only">Location</dt>
            <dd className="truncate font-medium">{job.location}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-slate-300">
            <BriefcaseBusinessIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <dt className="sr-only">Employment type</dt>
            <dd className="truncate font-medium">{job.type}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-slate-300">
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
              <Badge tone="accent" className="max-w-full truncate bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {job.workMode}
              </Badge>
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="slate" className="bg-slate-800 text-slate-300">{job.level}</Badge>
          {job.skills.slice(0, 2).map((skill) =>
          <Badge key={skill} tone="brand" className="bg-brand-500/20 text-brand-200 border border-brand-500/30">
              {skill}
            </Badge>
          )}
          {job.skills.length > 2 &&
          <Badge tone="slate" className="bg-slate-800 text-slate-400">+{job.skills.length - 2}</Badge>
          }
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Estimated salary
            </p>
            <p className={`mt-1 font-display text-lg font-bold ${job.salaryMin <= 0 && job.salaryMax <= 0 ? 'text-slate-400' : 'text-white'}`}>
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!hideCandidateActions && (
              <button
                type="button"
                onClick={() => toggleSaveJob(job.id, {
                  title: job.title,
                  company: job.company,
                  logo: job.companyLogo,
                  location: job.location,
                })}
                disabled={!isAuthenticated}
                title={
                isAuthenticated ?
                saved ?
                'Remove saved job' :
                'Save job' :
                'Sign in to save'
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:border-brand-500 hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={saved ? 'Remove saved job' : 'Save job'}
                aria-pressed={saved}>
                
                <BookmarkIcon
                  className={`h-[18px] w-[18px] ${saved ? 'fill-teal-300 text-teal-300' : ''}`} />
                
              </button>
            )}
            <Link
              to={`/jobs/${job.id}`}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition-all hover:bg-brand-500 shadow-md shadow-brand-600/30">
              
              <span className="hidden sm:inline">View role</span>
              <span className="sm:hidden">View</span>
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
);

}