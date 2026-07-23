import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  BookmarkIcon,
  CheckIcon,
  ArrowLeftIcon,
  BuildingIcon,
  CheckCircle2Icon,
  Share2Icon,
  Loader2Icon,
  SparklesIcon,
} from 'lucide-react';
import { publicApi, candidateApi, type PublicJob, type JobRecommendationDto } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ApplyModal } from '../components/ApplyModal';
import { MatchScore } from '../components/ui/MatchScore';
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
      <h2 className="font-display text-lg font-extrabold text-white">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-300 font-medium">
            <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" />
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
  const [apiJob, setApiJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    publicApi
      .getJobById(id)
      .then((job) => setApiJob(job))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
        <Loader2Icon className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (notFound || !apiJob) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-white">
        <h1 className="font-display text-2xl font-extrabold text-white">Job not found</h1>
        <p className="mt-2 text-slate-400">This role may have been filled or removed.</p>
        <Button className="mt-6 bg-brand-600 hover:bg-brand-500 text-white font-bold" onClick={() => navigate('/jobs')}>
          Back to jobs
        </Button>
      </div>
    );
  }

  return <ApiJobDetail job={apiJob} />;
}

function ApiJobDetail({ job }: { job: PublicJob }) {
  const navigate = useNavigate();
  const { isAuthenticated, isSaved, toggleSaveJob, hasApplied, user } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<JobRecommendationDto[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    candidateApi
      .getRecommendations()
      .then(setRecommendations)
      .catch(() => {});
  }, [isAuthenticated, user?.skills]);

  const matchRec = useMemo(() => {
    return recommendations.find((r) => r.jobId === job.id);
  }, [recommendations, job.id]);

  const realMatchScore = useMemo(() => {
    if (!isAuthenticated || !user) return undefined;
    if (matchRec) return matchRec.matchScore;

    const userSkills = (user.skills || []).map((s) => s.toLowerCase().trim());
    const jobSkills = (job.requiredSkills ?? []).map((s) => s.toLowerCase().trim());
    if (jobSkills.length === 0) return 50;

    const overlap = jobSkills.filter((s) => userSkills.includes(s));
    return Math.round((overlap.length * 100) / jobSkills.length);
  }, [isAuthenticated, user, matchRec, job.requiredSkills]);

  const saved = isSaved(job.id);
  const applied = hasApplied(job.id);
  const role = (user?.title ?? '').toLowerCase();
  const hideCandidateActions =
    role === 'admin' || role === 'recruiter' || role === 'hiringmanager';
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
    matchScore: realMatchScore,
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
    <div className="w-full bg-slate-950 text-white min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-teal-300 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to jobs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <img
                src={logoUrl}
                alt={`${companyName} logo`}
                className="h-16 w-16 flex-shrink-0 rounded-2xl ring-1 ring-slate-700 bg-slate-950"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-extrabold text-white">
                    {job.title}
                  </h1>
                  <Badge tone="green" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Live</Badge>
                </div>
                <p className="mt-1 font-semibold text-teal-300">{companyName}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4 text-teal-400" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseIcon className="h-4 w-4 text-teal-400" />{' '}
                    {job.employmentType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4 text-teal-400" /> {postedLabel}
                  </span>
                  {job.deadline && (
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                      <ClockIcon className="h-4 w-4 text-amber-400" />
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isAuthenticated && !hideCandidateActions && realMatchScore !== undefined && (
              <div className="flex items-center gap-3.5 rounded-2xl border border-brand-500/30 bg-slate-950/70 p-4 shadow-lg text-white">
                <MatchScore score={realMatchScore} size={54} />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
                    <SparklesIcon className="h-3.5 w-3.5 text-teal-400" />
                    <span>AI Match Score</span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-300 max-w-[220px] line-clamp-2">
                    {matchRec?.matchExplanation ||
                      (realMatchScore >= 80
                        ? 'Strong alignment with your profile skills & experience.'
                        : realMatchScore >= 60
                        ? 'Good skill overlap with role requirements.'
                        : 'Moderate alignment with required skill set.')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="brand" className="bg-brand-500/20 text-teal-300 border-brand-500/30">
              {job.employmentType.replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
            {job.departmentName && <Badge tone="accent" className="bg-teal-500/20 text-teal-300 border-teal-500/30">{job.departmentName}</Badge>}
            {job.experienceRequired && (
              <Badge tone="slate" className="bg-slate-800 text-slate-300 border-slate-700">{job.experienceRequired}</Badge>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display text-xl font-extrabold text-white">
              {formatApiSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              {(job.salaryMin || job.salaryMax) && (
                <span className="ml-1 text-sm font-normal text-slate-400">/ year</span>
              )}
            </span>
            <div className="flex gap-2">
              {!hideCandidateActions && (
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                  onClick={() =>
                    isAuthenticated
                      ? toggleSaveJob(job.id, {
                          title: job.title,
                          company: companyName,
                          logo: logoUrl,
                          location: job.location,
                        })
                      : navigate('/login')
                  }
                  aria-pressed={saved}
                >
                  <BookmarkIcon
                    className={`h-4 w-4 ${saved ? 'fill-teal-400 text-teal-400' : ''}`}
                  />
                  {saved ? 'Saved' : 'Save'}
                </Button>
              )}
              <Button variant="outline" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold" aria-label="Share job">
                <Share2Icon className="h-4 w-4" />
              </Button>
              {!hideCandidateActions &&
                (applied ? (
                  <Button variant="secondary" disabled className="bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold">
                    <CheckCircle2Icon className="h-4 w-4" /> Applied
                  </Button>
                ) : (
                  <Button onClick={onApply} className="bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/30">
                    {isAuthenticated ? 'Apply now' : 'Sign up to apply'}
                  </Button>
                ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl text-white sm:p-8">
              <h2 className="font-display text-lg font-extrabold text-white">
                About the role
              </h2>
              <div className="mt-3 space-y-3">
                {descParagraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-300 font-medium">
                    {p}
                  </p>
                ))}
              </div>

              {job.requirements && (
                <div className="mt-8 border-t border-slate-800 pt-6">
                  <h2 className="font-display text-lg font-extrabold text-white">
                    Key Requirements
                  </h2>
                  <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300 font-medium">
                    {job.requirements}
                  </div>
                </div>
              )}

              {job.requiredSkills.length > 0 && (
                <div className="mt-8">
                  <Section title="What we're looking for" items={job.requiredSkills} />
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            {job.requiredSkills.length > 0 && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl text-white">
                <h3 className="font-display text-base font-extrabold text-white">
                  Required skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.requiredSkills.map((s) => (
                    <Badge key={s} tone="brand" className="bg-brand-500/20 text-teal-300 border-brand-500/30">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl text-white">
              <h3 className="font-display text-base font-extrabold text-white">
                Job details
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Type</dt>
                  <dd className="font-bold text-white">
                    {job.employmentType.replace(/([A-Z])/g, ' $1').trim()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Location</dt>
                  <dd className="font-bold text-white">{job.location}</dd>
                </div>
                {job.experienceRequired && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Experience</dt>
                    <dd className="font-bold text-white">
                      {job.experienceRequired}
                    </dd>
                  </div>
                )}
                {job.departmentName && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Department</dt>
                    <dd className="font-bold text-white">
                      {job.departmentName}
                    </dd>
                  </div>
                )}
                {job.deadline && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Apply by</dt>
                    <dd className="font-bold text-amber-400">
                      {new Date(job.deadline).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-400">Posted</dt>
                  <dd className="font-bold text-white">{postedLabel}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl text-white">
              <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-white">
                <BuildingIcon className="h-4 w-4 text-teal-400" /> {companyName}
              </h3>
              <p className="mt-2 text-sm text-slate-300 font-medium">
                Explore open roles and learn more about the team at {companyName}.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                onClick={() => navigate('/companies')}
              >
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

