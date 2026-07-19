import { useEffect, useState } from 'react';
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
  ArrowRightIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Job } from '../data/jobs';
import { StatCard } from '../components/dashboard/StatCard';
import { ApplicationsTable } from '../components/dashboard/ApplicationsTable';
import { CandidateInterviews } from '../components/dashboard/CandidateInterviews';
import { ProfilePanel } from '../components/dashboard/ProfilePanel';
import { JobCard } from '../components/JobCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  candidateApi,
  publicApi,
  type InterviewDto,
  type PublicJob,
} from '../services/api';

type Tab = 'overview' | 'recommendations' | 'saved' | 'profile';

const tabs: {
  id: Tab;
  label: string;
  icon: typeof UserIcon;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboardIcon },
  { id: 'recommendations', label: 'AI Matches', icon: SparklesIcon },
  { id: 'saved', label: 'Saved', icon: BookmarkIcon },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

const EMPLOYMENT_TYPE_LABEL: Record<string, Job['type']> = {
  FullTime: 'Full-time',
  PartTime: 'Part-time',
  Contract: 'Contract',
  Internship: 'Internship',
  Remote: 'Full-time',
};

function stringToColor(str: string): string {
  const colors = ['4f46e5', '0d9488', '7c3aed', 'db2777', 'ea580c', '2563eb', '0284c7'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function toJob(p: PublicJob): Job {
  const publishedMs = new Date(p.publishedAt).getTime();
  const postedDaysAgo = Math.max(
    1,
    Math.floor((Date.now() - publishedMs) / (1000 * 60 * 60 * 24))
  );
  const companyName = p.postedBy || p.organizationName || 'Company';
  const bg = stringToColor(companyName);

  return {
    id: p.id,
    title: p.title,
    company: companyName,
    companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=${bg}&color=fff&bold=true&size=128&format=png`,
    location: p.location,
    workMode: p.employmentType === 'Remote' ? 'Remote' : 'On-site',
    type: EMPLOYMENT_TYPE_LABEL[p.employmentType] ?? 'Full-time',
    level: 'Mid',
    salaryMin: p.salaryMin ?? -1,
    salaryMax: p.salaryMax ?? -1,
    salaryCurrency: p.salaryCurrency || 'USD',
    postedDaysAgo,
    category: p.departmentName ?? 'General',
    skills: p.requiredSkills,
    shortDescription: p.description.slice(0, 300),
    responsibilities: [],
    requirements: p.requiredSkills,
    benefits: [],
    applicants: 0,
    matchScore: 75,
    featured: false,
  };
}

function savedToJob(s: {
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  jobCompanyLogo: string;
  jobLocation: string;
}): Job {
  return {
    id: s.jobId,
    title: s.jobTitle,
    company: s.jobCompany,
    companyLogo: s.jobCompanyLogo,
    location: s.jobLocation,
    workMode: 'On-site',
    type: 'Full-time',
    level: 'Mid',
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
  };
}

export function Dashboard() {
  const { user, isAuthenticated, applications, savedJobs } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [liveJobs, setLiveJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);

  useEffect(() => {
    publicApi
      .getPublishedJobs()
      .then((jobs) => setLiveJobs(jobs.map(toJob)))
      .catch(() => setLiveJobs([]))
      .finally(() => setJobsLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    candidateApi
      .getInterviews()
      .then(setInterviews)
      .catch(() => setInterviews([]));
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
  }

  const recommended = [...liveJobs]
    .sort((a, b) => a.postedDaysAgo - b.postedDaysAgo)
    .slice(0, 6);

  const allSaved = savedJobs.map(savedToJob);
  const interviewCount = interviews.length;
  const topMatch = recommended[0]?.matchScore;

  return (
    <div className="w-full bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Welcome back,</p>
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

          <div className="mt-6 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? 'text-brand-700'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {tab === t.id && (
                  <motion.span
                    layoutId="dash-tab"
                    className="absolute inset-x-2 -bottom-[9px] h-0.5 rounded-full bg-brand-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                icon={BriefcaseIcon}
                label="Applications"
                value={applications.length}
                tone="brand"
              />
              <StatCard
                icon={CalendarCheckIcon}
                label="Interviews"
                value={interviewCount}
                tone="accent"
              />
              <StatCard
                icon={BookmarkIcon}
                label="Saved jobs"
                value={savedJobs.length}
                tone="blue"
              />
              <StatCard
                icon={TrophyIcon}
                label="Top match"
                value={topMatch != null ? `${topMatch}%` : '—'}
                tone="amber"
              />
            </div>

            {interviewCount > 0 && (
              <CandidateInterviews interviews={interviews} />
            )}

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
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  See all
                </button>
              </div>
              {jobsLoading ? (
                <p className="text-sm text-slate-500">Loading roles…</p>
              ) : recommended.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {recommended.slice(0, 3).map((job) => (
                    <JobCard key={job.id} job={job} showMatch />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
                  <p className="font-semibold text-slate-900">No open roles yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Check back soon or browse all jobs when recruiters publish openings.
                  </p>
                  <Link to="/jobs">
                    <Button className="mt-4" variant="outline">
                      Browse jobs
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'recommendations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6 flex items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  AI-powered recommendations
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Live openings from recruiters on Talenta. Add more skills to your
                  profile to sharpen match quality as scoring improves.
                </p>
              </div>
            </div>
            {jobsLoading ? (
              <p className="text-sm text-slate-500">Loading roles…</p>
            ) : recommended.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {recommended.map((job) => (
                  <JobCard key={job.id} job={job} showMatch />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <SparklesIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-900">No matches yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Published jobs will appear here as soon as they are available.
                </p>
                <Link to="/jobs">
                  <Button className="mt-5">Browse jobs</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'saved' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                Saved jobs
              </h2>
              <Badge tone="slate">{allSaved.length}</Badge>
            </div>
            {allSaved.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {allSaved.map((job) => (
                  <JobCard key={job.id} job={job} showMatch />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <BookmarkIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-900">No saved jobs yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Tap the bookmark on any role to save it here.
                </p>
                <Link to="/jobs">
                  <Button className="mt-5">Browse jobs</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProfilePanel />
          </motion.div>
        )}
      </div>
    </div>
  );
}
