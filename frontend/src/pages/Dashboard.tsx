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
  type JobRecommendationDto,
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
    matchScore: 0,
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
    matchScore: 0,
    featured: false,
  };
}

function recToJob(r: JobRecommendationDto): Job {
  const companyName = r.company || 'Company';
  const bg = stringToColor(companyName);

  return {
    id: r.jobId,
    title: r.jobTitle,
    company: companyName,
    companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=${bg}&color=fff&bold=true&size=128&format=png`,
    location: r.location,
    workMode: r.employmentType === 'Remote' ? 'Remote' : 'On-site',
    type: EMPLOYMENT_TYPE_LABEL[r.employmentType] ?? 'Full-time',
    level: 'Mid',
    salaryMin: r.salaryMin ?? -1,
    salaryMax: r.salaryMax ?? -1,
    salaryCurrency: r.salaryCurrency || 'USD',
    postedDaysAgo: 1,
    category: 'General',
    skills: r.requiredSkills,
    shortDescription: r.description ? r.description.slice(0, 300) : '',
    responsibilities: [],
    requirements: r.requiredSkills,
    benefits: [],
    applicants: 0,
    matchScore: r.matchScore,
    featured: false,
  };
}

export function Dashboard() {
  const { user, isAuthenticated, applications, savedJobs } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [liveJobs, setLiveJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendationDto[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    setRecommendationsLoading(true);
    candidateApi
      .getRecommendations()
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
      .finally(() => setRecommendationsLoading(false));
  }, [isAuthenticated, user?.skills, user?.resumeUrl]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
  }

  const recommended = [...liveJobs]
    .sort((a, b) => a.postedDaysAgo - b.postedDaysAgo)
    .slice(0, 6);

  const allSaved = savedJobs.map(savedToJob);
  const interviewCount = interviews.length;
  const profileCompleteness = user.completenessPercent;
  const topMatch =
    profileCompleteness != null
      ? `${profileCompleteness}%`
      : applications.length > 0
        ? String(applications.length)
        : '—';
  const topMatchLabel =
    profileCompleteness != null ? 'Profile strength' : 'Applications';

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
                label={topMatchLabel}
                value={topMatch}
                tone="amber"
              />
            </div>

            <div>
              <h2 className="mb-4 font-display text-xl font-extrabold text-slate-900">
                Your applications
              </h2>
              <ApplicationsTable
                applications={applications}
                interviews={interviews}
              />
            </div>

            {interviewCount > 0 && (
              <CandidateInterviews interviews={interviews} />
            )}

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
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white animate-pulse">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  AI-powered recommendations
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  TalentPortal AI matches you with the best available job roles based on the skills, location, and experiences in your profile. Update your resume to refine the matches.
                </p>
              </div>
            </div>
            {recommendationsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
                <p className="mt-4 text-sm text-slate-500 font-semibold animate-pulse">AI is running matching criteria...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {recommendations.map((rec) => {
                  const job = recToJob(rec);
                  return (
                    <div
                      key={rec.jobId}
                      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex-1">
                        <JobCard job={job} showMatch={false} />
                      </div>
                      
                      {/* Premium AI Match Badge & Explanation */}
                      <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/40 p-3.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${
                            rec.matchScore >= 80 ? 'bg-emerald-600' : rec.matchScore >= 50 ? 'bg-amber-600' : 'bg-slate-500'
                          }`}>
                            {rec.matchScore}% Match
                          </span>
                          <span className="text-xs font-semibold text-brand-700 flex items-center gap-0.5">
                            <SparklesIcon className="h-3 w-3" /> AI Fit Analysis
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {rec.matchExplanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <SparklesIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-900">No matches yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  No matches were found. Try updating your profile or uploading a resume to enrich your matching profile.
                </p>
                <button
                  onClick={() => setTab('profile')}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-750 transition-colors"
                >
                  Go to Profile
                </button>
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
