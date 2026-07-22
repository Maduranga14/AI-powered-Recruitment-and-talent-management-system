import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
  SparklesIcon,
} from 'lucide-react';
import { CATEGORIES, type WorkMode, type JobType, type Job } from '../data/jobs';
import { JobCard } from '../components/JobCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { publicApi, candidateApi, type PublicJob, type JobRecommendationDto } from '../services/api';

const WORK_MODES: WorkMode[] = ['Remote', 'Hybrid', 'On-site'];
const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];

type SortKey = 'match' | 'recent' | 'salary';

// Map backend employment type string → JobType label used in the UI
const EMPLOYMENT_TYPE_LABEL: Record<string, JobType> = {
  FullTime: 'Full-time',
  PartTime: 'Part-time',
  Contract: 'Contract',
  Internship: 'Internship',
  Remote: 'Full-time', // Remote is a work mode, not a job type
};

// Convert a PublicJob from the API into the Job shape used by JobCard
function toJob(p: PublicJob): Job {
  const publishedMs = new Date(p.publishedAt).getTime();
  const postedDaysAgo = Math.max(
    1,
    Math.floor((Date.now() - publishedMs) / (1000 * 60 * 60 * 24))
  );

  const salaryMin = p.salaryMin ?? -1;
  const salaryMax = p.salaryMax ?? -1;

  const companyName = p.postedBy || p.organizationName || 'Company';
  const bgColor = stringToColor(companyName);

  return {
    id: p.id,
    title: p.title,
    company: companyName,
    companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=${bgColor}&color=fff&bold=true&size=128&format=png`,
    location: p.location,
    workMode: p.employmentType === 'Remote' ? 'Remote' : 'On-site',
    type: EMPLOYMENT_TYPE_LABEL[p.employmentType] ?? 'Full-time',
    level: 'Mid',
    salaryMin,
    salaryMax,
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

// Simple deterministic color from a string
function stringToColor(str: string): string {
  const colors = ['4f46e5', '0d9488', '7c3aed', 'db2777', 'ea580c', '2563eb', '0284c7'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-slate-600 hover:text-slate-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  );
}

export function Jobs() {
  const [params, setParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState(params.get('q') || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [modes, setModes] = useState<WorkMode[]>([]);
  const [types, setTypes] = useState<JobType[]>([]);
  const [sort, setSort] = useState<SortKey>('recent');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // AI Recommendations filter state
  const [showAiRecs, setShowAiRecs] = useState(false);
  const [recsMap, setRecsMap] = useState<Record<string, number>>({});
  const [recsLoading, setRecsLoading] = useState(false);

  // Backend jobs state
  const [apiJobs, setApiJobs] = useState<Job[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    setApiError('');
    setApiLoading(true);

    publicApi.getPublishedJobs()
      .then((jobs) => setApiJobs(jobs.map(toJob)))
      .catch((err) => {
        console.error('[Jobs] failed to load live jobs:', err);
        setApiError(err?.message ?? 'Could not load live jobs.');
        setApiJobs([]);
      })
      .finally(() => setApiLoading(false));
  }, []);

  const toggleAiRecommendations = async () => {
    const nextVal = !showAiRecs;
    setShowAiRecs(nextVal);
    if (nextVal) {
      setSort('match');
      if (Object.keys(recsMap).length === 0 && isAuthenticated) {
        setRecsLoading(true);
        try {
          const recs = await candidateApi.getRecommendations();
          const map: Record<string, number> = {};
          recs.forEach((r) => { map[r.jobId] = r.matchScore; });
          setRecsMap(map);
        } catch (err) {
          console.error('[Jobs] Failed to fetch AI recommendations:', err);
        } finally {
          setRecsLoading(false);
        }
      }
    }
  };

  const toggle = <T,>(arr: T[], set: (v: T[]) => void, value: T) =>
    set(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

  // Map AI recommendation scores onto jobs
  const allJobs = useMemo(() => {
    return apiJobs.map((j) => ({
      ...j,
      matchScore: showAiRecs ? (recsMap[j.id] ?? 50) : 0,
    }));
  }, [apiJobs, showAiRecs, recsMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = allJobs.filter((job) => {
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q));
      const matchesCat = !categories.length || categories.includes(job.category);
      const matchesMode = !modes.length || modes.includes(job.workMode);
      const matchesType = !types.length || types.includes(job.type);
      return matchesQuery && matchesCat && matchesMode && matchesType;
    });
    result.sort((a, b) => {
      if (sort === 'match') return b.matchScore - a.matchScore;
      if (sort === 'salary') return b.salaryMax - a.salaryMax;
      return a.postedDaysAgo - b.postedDaysAgo;
    });
    return result;
  }, [allJobs, query, categories, modes, types, sort]);

  const activeFilterCount = categories.length + modes.length + types.length;

  const clearAll = () => {
    setCategories([]);
    setModes([]);
    setTypes([]);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(query ? { q: query } : {});
  };

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-slate-900">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {isAuthenticated && (
        <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-indigo-50/80 p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-brand-600" />
              <span className="text-xs font-bold text-slate-900">AI Recommendations</span>
            </div>
            <input
              type="checkbox"
              checked={showAiRecs}
              onChange={toggleAiRecommendations}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-slate-600">
            Enable to see personalized AI match percentages on all job cards.
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Category
        </h3>
        {CATEGORIES.map((c) => (
          <CheckboxRow
            key={c}
            label={c}
            checked={categories.includes(c)}
            onChange={() => toggle(categories, setCategories, c)}
          />
        ))}
      </div>

      <div>
        <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Work mode
        </h3>
        {WORK_MODES.map((m) => (
          <CheckboxRow
            key={m}
            label={m}
            checked={modes.includes(m)}
            onChange={() => toggle(modes, setModes, m)}
          />
        ))}
      </div>

      <div>
        <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Job type
        </h3>
        {JOB_TYPES.map((t) => (
          <CheckboxRow
            key={t}
            label={t}
            checked={types.includes(t)}
            onChange={() => toggle(types, setTypes, t)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-slate-50">
      {/* Search header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-slate-900">
            Find your next role
          </h1>
          <p className="mt-1 text-slate-500">
            {isAuthenticated
              ? 'Roles are ranked by your AI match score.'
              : 'Sign in to unlock personalized AI match scores.'}
          </p>
          <form onSubmit={onSearch} className="mt-6 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <SearchIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, skill, or company"
                className="w-full bg-transparent py-3 text-sm focus:outline-none"
                aria-label="Search jobs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setParams({});
                  }}
                  aria-label="Clear search"
                >
                  <XIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontalIcon className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Desktop filters */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            {filterPanel}
          </div>
        </aside>

        {/* Results */}
        <main className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {apiLoading ? (
                <span className="text-slate-400">Loading jobs…</span>
              ) : (
                <>
                  <span className="font-bold text-slate-900">{filtered.length}</span> jobs found
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={toggleAiRecommendations}
                  disabled={recsLoading}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                    showAiRecs
                      ? 'bg-brand-600 text-white shadow-brand-500/20 hover:bg-brand-700'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  <SparklesIcon className={`h-3.5 w-3.5 ${showAiRecs ? 'text-amber-300 animate-pulse' : 'text-brand-500'}`} />
                  {recsLoading ? 'Analyzing AI Match...' : showAiRecs ? 'AI Recommendations: ON' : 'AI Recommendations'}
                </button>
              )}
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="recent">Most recent</option>
                  <option value="match">AI match</option>
                  <option value="salary">Salary</option>
                </select>
              </label>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {[...categories, ...modes, ...types].map((f) => (
                <Badge key={f} tone="brand">
                  {f}
                </Badge>
              ))}
            </div>
          )}

          {/* Live jobs from backend shown first with a subtle indicator */}
          {!apiLoading && apiError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              Could not load live jobs: {apiError}
            </div>
          )}

          {apiLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} showMatch={showAiRecs} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <SparklesIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-900">No jobs match your filters</p>
              <p className="mt-1 text-sm text-slate-500">
                Try broadening your search or clearing filters.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => {
                  setQuery('');
                  clearAll();
                  setParams({});
                }}
              >
                Reset search
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display font-bold text-slate-900">Filters</span>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <XIcon className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              {filterPanel}
              <Button fullWidth className="mt-6" onClick={() => setFiltersOpen(false)}>
                Show {filtered.length} jobs
              </Button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
