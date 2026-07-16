import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  UsersIcon,
  BookmarkIcon,
  CheckIcon,
  ArrowLeftIcon,
  BuildingIcon,
  CheckCircle2Icon,
  Share2Icon } from
'lucide-react';
import { getJob, formatSalary, JOBS } from '../data/jobs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MatchScore } from '../components/ui/MatchScore';
import { JobCard } from '../components/JobCard';
import { ApplyModal } from '../components/ApplyModal';
import { useAuth } from '../context/AuthContext';
export function JobDetail() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const job = id ? getJob(id) : undefined;
  const { isAuthenticated, hasApplied, savedJobs, toggleSaveJob } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);
  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Job not found
        </h1>
        <p className="mt-2 text-slate-500">
          This role may have been filled or removed.
        </p>
        <Button className="mt-6" onClick={() => navigate('/jobs')}>
          Back to jobs
        </Button>
      </div>);

  }
  const applied = hasApplied(job.id);
  const saved = savedJobs.includes(job.id);
  const onApply = () => {
    if (!isAuthenticated) {
      navigate(`/register?redirect=/jobs/${job.id}`);
      return;
    }
    setApplyOpen(true);
  };
  const related = JOBS.filter(
    (j) => j.category === job.category && j.id !== job.id
  ).slice(0, 3);
  const Section = ({ title, items }: {title: string;items: string[];}) =>
  <div>
      <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) =>
      <li key={item} className="flex gap-3 text-sm text-slate-600">
            <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-600" />
            <span>{item}</span>
          </li>
      )}
      </ul>
    </div>;

  return (
    <div className="w-full bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          
          <ArrowLeftIcon className="h-4 w-4" /> Back to jobs
        </Link>

        {/* Header card */}
        <motion.div
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <img
                src={job.companyLogo}
                alt={`${job.company} logo`}
                className="h-16 w-16 flex-shrink-0 rounded-2xl ring-1 ring-slate-100" />
              
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-extrabold text-slate-900">
                    {job.title}
                  </h1>
                  {job.featured && <Badge tone="amber">Featured</Badge>}
                </div>
                <p className="mt-1 font-medium text-slate-600">{job.company}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseIcon className="h-4 w-4" /> {job.type}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" /> {job.postedDaysAgo}d ago
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UsersIcon className="h-4 w-4" /> {job.applicants}{' '}
                    applicants
                  </span>
                </div>
              </div>
            </div>
            {isAuthenticated &&
            <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-3">
                <MatchScore score={job.matchScore} size={56} />
                <span className="mt-1 text-xs font-semibold text-slate-500">
                  AI match
                </span>
              </div>
            }
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="brand">{job.workMode}</Badge>
            <Badge tone="slate">{job.level}</Badge>
            <Badge tone="accent">{job.category}</Badge>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display text-xl font-bold text-slate-900">
              {formatSalary(job.salaryMin, job.salaryMax)}
              <span className="ml-1 text-sm font-normal text-slate-400">
                / year
              </span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                isAuthenticated ? toggleSaveJob(job.id) : navigate('/login')
                }
                aria-pressed={saved}>
                
                <BookmarkIcon
                  className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
                
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" aria-label="Share job">
                <Share2Icon className="h-4 w-4" />
              </Button>
              {applied ?
              <Button variant="secondary" disabled>
                  <CheckCircle2Icon className="h-4 w-4" /> Applied
                </Button> :

              <Button onClick={onApply}>
                  {isAuthenticated ? 'Apply now' : 'Sign up to apply'}
                </Button>
              }
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-lg font-bold text-slate-900">
                About the role
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {job.shortDescription}
              </p>
              <div className="mt-8 space-y-8">
                <Section title="What you'll do" items={job.responsibilities} />
                <Section
                  title="What we're looking for"
                  items={job.requirements} />
                
                <Section title="Benefits & perks" items={job.benefits} />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="font-display text-base font-bold text-slate-900">
                Skills
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((s) =>
                <Badge key={s} tone="brand">
                    {s}
                  </Badge>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <BuildingIcon className="h-4 w-4 text-slate-400" />{' '}
                {job.company}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                A team building meaningful products with a people-first culture.
                Explore more open roles at {job.company}.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/companies')}>
                
                View company
              </Button>
            </div>
          </aside>
        </div>

        {related.length > 0 &&
        <section className="mt-14">
            <h2 className="font-display text-xl font-extrabold text-slate-900">
              Similar roles
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {related.map((j) =>
            <JobCard key={j.id} job={j} showMatch={isAuthenticated} />
            )}
            </div>
          </section>
        }
      </div>

      <ApplyModal
        job={job}
        open={applyOpen}
        onClose={() => setApplyOpen(false)} />
      
    </div>);

}