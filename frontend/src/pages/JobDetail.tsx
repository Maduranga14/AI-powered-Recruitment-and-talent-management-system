import { useState, useEffect } from 'react';
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
  Share2Icon,
  Loader2Icon,
} from 'lucide-react';
import { getJob, formatSalary, JOBS, type Job } from '../data/jobs';
import { publicApi, type PublicJob } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MatchScore } from '../components/ui/MatchScore';
import { JobCard } from '../components/JobCard';
import { ApplyModal } from '../components/ApplyModal';
import { useAuth } from '../context/AuthContext';



function stringToColor(str: string): string {
  const colors = ['4f46e5', '0d9488', '7c3aed', 'db2777', 'ea580c', '2563eb', '0284c7'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatApiSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return 'Salary not specified';
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : n.toString();
  if (min && max) return `${currency} ${fmt(min)} – ${fmt(max)}`;
  if (min) return `${currency} ${fmt(min)}+`;
  return `Up to ${currency} ${fmt(max!)}`;
}

function msToPostedLabel(publishedAt: string): string {
  const diff = Math.floor((Date.now() - new Date(publishedAt).getTime()) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}



function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-600">
            <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  
  const staticJob = id ? getJob(id) : undefined;

  
  const [apiJob, setApiJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(!staticJob); // only load if static not found
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (staticJob || !id) return; // static job found, no need to fetch
    setLoading(true);
    publicApi
      .getJobById(id)
      .then((job) => setApiJob(job))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, staticJob]);

  
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  
  if (notFound || (!staticJob && !apiJob)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">Job not found</h1>
        <p className="mt-2 text-slate-500">This role may have been filled or removed.</p>
        <Button className="mt-6" onClick={() => navigate('/jobs')}>
          Back to jobs
        </Button>
      </div>
    );
  }

  
  if (staticJob) {
    return <StaticJobDetail job={staticJob} />;
  }

  
  return <ApiJobDetail job={apiJob!} />;
}



function StaticJobDetail({ job }: { job: Job }) {
  const navigate = useNavigate();
  const { isAuthenticated, hasApplied, isSaved, toggleSaveJob, user } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);

  const applied = hasApplied(job.id);
  const saved = isSaved(job.id);
  const isRecruiter = (user?.title ?? '').toLowerCase() === 'recruiter';

  const onApply = () => {
    if (!isAuthenticated) {
      navigate(`/register?redirect=/jobs/${job.id}`);
      return;
    }
    setApplyOpen(true);
  };

  const related = JOBS.filter((j) => j.category === job.category && j.id !== job.id).slice(0, 3);

  return (
    <div className="w-full bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to jobs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <img
                src={job.companyLogo}
                alt={`${job.company} logo`}
                className="h-16 w-16 flex-shrink-0 rounded-2xl ring-1 ring-slate-100"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-extrabold text-slate-900">{job.title}</h1>
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
                    <UsersIcon className="h-4 w-4" /> {job.applicants} applicants
                  </span>
                </div>
              </div>
            </div>
            {isAuthenticated && (
              <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-3">
                <MatchScore score={job.matchScore} size={56} />
                <span className="mt-1 text-xs font-semibold text-slate-500">AI match</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="brand">{job.workMode}</Badge>
            <Badge tone="slate">{job.level}</Badge>
            <Badge tone="accent">{job.category}</Badge>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display text-xl font-bold text-slate-900">
              {formatSalary(job.salaryMin, job.salaryMax)}
              <span className="ml-1 text-sm font-normal text-slate-400">/ year</span>
            </span>
            <div className="flex gap-2">
              {!isRecruiter && (
                <Button
                  variant="outline"
                  onClick={() => isAuthenticated ? toggleSaveJob(job.id, { title: job.title, company: job.company, logo: job.companyLogo, location: job.location }) : navigate('/login')}
                  aria-pressed={saved}
                >
                  <BookmarkIcon className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </Button>
              )}
              <Button variant="outline" aria-label="Share job">
                <Share2Icon className="h-4 w-4" />
              </Button>
              {!isRecruiter && (
                applied ? (
                  <Button variant="secondary" disabled>
                    <CheckCircle2Icon className="h-4 w-4" /> Applied
                  </Button>
                ) : (
                  <Button onClick={onApply}>
                    {isAuthenticated ? 'Apply now' : 'Sign up to apply'}
                  </Button>
                )
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-lg font-bold text-slate-900">About the role</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{job.shortDescription}</p>
              <div className="mt-8 space-y-8">
                <Section title="What you'll do" items={job.responsibilities} />
                <Section title="What we're looking for" items={job.requirements} />
                <Section title="Benefits & perks" items={job.benefits} />
              </div>
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="font-display text-base font-bold text-slate-900">Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <Badge key={s} tone="brand">{s}</Badge>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <BuildingIcon className="h-4 w-4 text-slate-400" /> {job.company}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                A team building meaningful products with a people-first culture. Explore more open roles
                at {job.company}.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/companies')}>
                View company
              </Button>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-xl font-extrabold text-slate-900">Similar roles</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {related.map((j) => (
                <JobCard key={j.id} job={j} showMatch={isAuthenticated} />
              ))}
            </div>
          </section>
        )}
      </div>

      <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}



function ApiJobDetail({ job }: { job: PublicJob }) {
  const navigate = useNavigate();
  const { isAuthenticated, isSaved, toggleSaveJob, hasApplied, user } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);

  const saved = isSaved(job.id);
  const applied = hasApplied(job.id);
  const isRecruiter = (user?.title ?? '').toLowerCase() === 'recruiter';
  const companyName = job.postedBy || job.organizationName || 'Company';
  const bgColor = stringToColor(companyName);
  const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=${bgColor}&color=fff&bold=true&size=128&format=png`;
  const postedLabel = msToPostedLabel(job.publishedAt);

  
  const applyJobShape = {
    id: job.id,
    title: job.title,
    company: companyName,
    companyLogo: logoUrl,
    location: job.location,
    skills: job.requiredSkills ?? [],
  };

  const onApply = () => {
    if (!isAuthenticated) {
      navigate(`/register?redirect=/jobs/${job.id}`);
      return;
    }
    setApplyOpen(true);
  };

  
  const descParagraphs = job.description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="w-full bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to jobs
        </Link>

        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="h-16 w-16 flex-shrink-0 rounded-2xl ring-1 ring-slate-100"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-extrabold text-slate-900">{job.title}</h1>
                  <Badge tone="green">Live</Badge>
                </div>
                <p className="mt-1 font-medium text-slate-600">{companyName}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseIcon className="h-4 w-4" /> {job.employmentType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" /> {postedLabel}
                  </span>
                  {job.deadline && (
                    <span className="inline-flex items-center gap-1.5 text-amber-600">
                      <ClockIcon className="h-4 w-4" />
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="brand">{job.employmentType.replace(/([A-Z])/g, ' $1').trim()}</Badge>
            {job.departmentName && <Badge tone="accent">{job.departmentName}</Badge>}
            {job.experienceRequired && <Badge tone="slate">{job.experienceRequired}</Badge>}
          </div>

         
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display text-xl font-bold text-slate-900">
              {formatApiSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              {(job.salaryMin || job.salaryMax) && (
                <span className="ml-1 text-sm font-normal text-slate-400">/ year</span>
              )}
            </span>
            <div className="flex gap-2">
              {!isRecruiter && (
                <Button
                  variant="outline"
                  onClick={() => isAuthenticated ? toggleSaveJob(job.id, { title: job.title, company: companyName, logo: logoUrl, location: job.location }) : navigate('/login')}
                  aria-pressed={saved}
                >
                  <BookmarkIcon className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </Button>
              )}
              <Button variant="outline" aria-label="Share job">
                <Share2Icon className="h-4 w-4" />
              </Button>
              {!isRecruiter && (
                applied ? (
                  <Button variant="secondary" disabled>
                    <CheckCircle2Icon className="h-4 w-4" /> Applied
                  </Button>
                ) : (
                  <Button onClick={onApply}>
                    {isAuthenticated ? 'Apply now' : 'Sign up to apply'}
                  </Button>
                )
              )}
            </div>
          </div>
        </motion.div>

        
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-lg font-bold text-slate-900">About the role</h2>
              <div className="mt-3 space-y-3">
                {descParagraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-600">
                    {p}
                  </p>
                ))}
              </div>

              {job.requiredSkills.length > 0 && (
                <div className="mt-8">
                  <Section title="What we're looking for" items={job.requiredSkills} />
                </div>
              )}
            </div>
          </div>

          
          <aside className="space-y-6">
            {job.requiredSkills.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <h3 className="font-display text-base font-bold text-slate-900">Required skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.requiredSkills.map((s) => (
                    <Badge key={s} tone="brand">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="font-display text-base font-bold text-slate-900">Job details</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Type</dt>
                  <dd className="font-semibold text-slate-900">
                    {job.employmentType.replace(/([A-Z])/g, ' $1').trim()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Location</dt>
                  <dd className="font-semibold text-slate-900">{job.location}</dd>
                </div>
                {job.experienceRequired && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Experience</dt>
                    <dd className="font-semibold text-slate-900">{job.experienceRequired}</dd>
                  </div>
                )}
                {job.departmentName && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Department</dt>
                    <dd className="font-semibold text-slate-900">{job.departmentName}</dd>
                  </div>
                )}
                {job.deadline && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Apply by</dt>
                    <dd className="font-semibold text-amber-600">
                      {new Date(job.deadline).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Posted</dt>
                  <dd className="font-semibold text-slate-900">{postedLabel}</dd>
                </div>
              </dl>
            </div>

            
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <BuildingIcon className="h-4 w-4 text-slate-400" /> {companyName}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Explore open roles and learn more about the team at {companyName}.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/companies')}>
                View company
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <ApplyModal job={applyJobShape} open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}
