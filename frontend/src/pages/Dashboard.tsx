import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboardIcon,
  SparklesIcon,
  UserIcon,
  BookmarkIcon,
  BriefcaseIcon,
  CalendarCheckIcon,
  TrophyIcon,
  ArrowRightIcon } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JOBS } from '../data/jobs';
import { StatCard } from '../components/dashboard/StatCard';
import { ApplicationsTable } from '../components/dashboard/ApplicationsTable';
import { ProfilePanel } from '../components/dashboard/ProfilePanel';
import { JobCard } from '../components/JobCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
type Tab = 'overview' | 'recommendations' | 'saved' | 'profile';
const tabs: {
  id: Tab;
  label: string;
  icon: typeof UserIcon;
}[] = [
{
  id: 'overview',
  label: 'Overview',
  icon: LayoutDashboardIcon
},
{
  id: 'recommendations',
  label: 'AI Matches',
  icon: SparklesIcon
},
{
  id: 'saved',
  label: 'Saved',
  icon: BookmarkIcon
},
{
  id: 'profile',
  label: 'Profile',
  icon: UserIcon
}];

export function Dashboard() {
  const { user, isAuthenticated, applications, savedJobs } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  if (!isAuthenticated || !user) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
  }
  const recommended = [...JOBS].sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);

  // Static saved jobs (mock data)
  const staticSaved = JOBS.filter((j) => savedJobs.some((s) => s.jobId === j.id));

  // Backend saved jobs (not in static JOBS) — build Job-compatible shape from stored metadata
  const backendSaved = savedJobs
    .filter((s) => !JOBS.some((j) => j.id === s.jobId))
    .map((s) => ({
      id: s.jobId,
      title: s.jobTitle,
      company: s.jobCompany,
      companyLogo: s.jobCompanyLogo,
      location: s.jobLocation,
      workMode: 'On-site' as const,
      type: 'Full-time' as const,
      level: 'Mid' as const,
      salaryMin: -1,
      salaryMax: -1,
      postedDaysAgo: 1,
      category: 'General',
      skills: [],
      shortDescription: '',
      responsibilities: [],
      requirements: [],
      benefits: [],
      applicants: 0,
      matchScore: 75,
      featured: false,
    }));

  const allSaved = [...staticSaved, ...backendSaved];
  const interviews = applications.filter((a) => a.status === 'Interview').length;
  return (
    <div className="w-full bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Welcome back,
              </p>
              <h1 className="font-display text-3xl font-extrabold text-slate-900">
                {user.name.split(' ')[0]} 👋
              </h1>
            </div>
            <Link to="/jobs">
              <Button>
                Find jobs <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 overflow-x-auto">
            {tabs.map((t) =>
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tab === t.id ? 'text-brand-700' : 'text-slate-500 hover:text-slate-900'}`}>
              
                <t.icon className="h-4 w-4" />
                {t.label}
                {tab === t.id &&
              <motion.span
                layoutId="dash-tab"
                className="absolute inset-x-2 -bottom-[9px] h-0.5 rounded-full bg-brand-600" />

              }
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === 'overview' &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          className="space-y-8">
          
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
              icon={BriefcaseIcon}
              label="Applications"
              value={applications.length}
              tone="brand" />
            
              <StatCard
              icon={CalendarCheckIcon}
              label="Interviews"
              value={interviews}
              tone="accent" />
            
              <StatCard
              icon={BookmarkIcon}
              label="Saved jobs"
              value={savedJobs.length}
              tone="blue" />
              <StatCard
              icon={TrophyIcon}
              label="Top match"
              value={`${recommended[0].matchScore}%`}
              tone="amber" />
            
            </div>

            <div>
              <h2 className="mb-4 font-display text-xl font-extrabold text-slate-900">
                Your applications
              </h2>
              <ApplicationsTable applications={applications} />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-slate-900">
                  Recommended for you
                </h2>
                <button
                onClick={() => setTab('recommendations')}
                className="text-sm font-semibold text-brand-600 hover:underline">
                
                  See all
                </button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {recommended.slice(0, 3).map((job) =>
              <JobCard key={job.id} job={job} showMatch />
              )}
              </div>
            </div>
          </motion.div>
        }

        {tab === 'recommendations' &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}>
          
            <div className="mb-6 flex items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  AI-powered recommendations
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Ranked by how closely each role matches your skills,
                  experience, and preferences. Add more skills to your profile
                  to sharpen these results.
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {recommended.map((job) =>
            <JobCard key={job.id} job={job} showMatch />
            )}
            </div>
          </motion.div>
        }

        {tab === 'saved' &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}>
          
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                Saved jobs
              </h2>
              <Badge tone="slate">{allSaved.length}</Badge>
            </div>
            {allSaved.length > 0 ?
          <div className="grid gap-6 sm:grid-cols-2">
                {allSaved.map((job) =>
            <JobCard key={job.id} job={job} showMatch />
            )}
              </div> :

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <BookmarkIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-900">
                  No saved jobs yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tap the bookmark on any role to save it here.
                </p>
                <Link to="/jobs">
                  <Button className="mt-5">Browse jobs</Button>
                </Link>
              </div>
          }
          </motion.div>
        }

        {tab === 'profile' &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}>
          
            <ProfilePanel />
          </motion.div>
        }
      </div>
    </div>);

}