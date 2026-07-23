import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  SearchIcon,
  ArrowRightIcon,
  BrainCircuitIcon,
  CalendarCheckIcon,
  LineChartIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  FileCheckIcon,
  CheckIcon,
  StarIcon } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { JobCard } from '../components/JobCard';
import { type Job } from '../data/jobs';import { publicApi } from '../services/api';

// reuse the same converter from Jobs.tsx inline
const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  FullTime: 'Full-time', PartTime: 'Part-time', Contract: 'Contract',
  Internship: 'Internship', Remote: 'Full-time',
};
function stringToColor(str: string): string {
  const colors = ['4f46e5', '0d9488', '7c3aed', 'db2777', 'ea580c', '2563eb', '0284c7'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
const HERO_IMG = "/319f6e15-d12b-45d3-abbd-034800eb8b5b.jpg";

const companies = [
'Northwind Labs',
'Bloomly',
'Vantage AI',
'Cascade',
'Meridian',
'Hue & Co'];

const features = [
{
  icon: BrainCircuitIcon,
  title: 'AI job matching',
  desc: 'Our models read your skills, experience, and goals to surface roles you are genuinely likely to land.'
},
{
  icon: FileCheckIcon,
  title: 'Smart CV parsing',
  desc: 'Upload once. We extract your experience and keep your profile polished and recruiter-ready.'
},
{
  icon: CalendarCheckIcon,
  title: 'Effortless scheduling',
  desc: 'Book interviews in a couple of taps with automatic timezone handling and reminders.'
},
{
  icon: LineChartIcon,
  title: 'Application insights',
  desc: 'Track every application in one dashboard and see where you stand at each stage.'
},
{
  icon: ShieldCheckIcon,
  title: 'Private by design',
  desc: 'You control exactly what recruiters can see. Stay confidential until you are ready.'
},
{
  icon: SparklesIcon,
  title: 'Personalized coaching',
  desc: 'Get AI-crafted tips to strengthen your profile and stand out for each role.'
}];

const steps = [
{
  icon: UserPlusIcon,
  title: 'Create your profile',
  desc: 'Sign up in seconds and upload your CV. Our AI builds a rich, structured profile instantly.'
},
{
  icon: BrainCircuitIcon,
  title: 'Get matched',
  desc: 'Receive a curated feed of roles ranked by how well they fit your skills and ambitions.'
},
{
  icon: CheckIcon,
  title: 'Apply & track',
  desc: 'Apply with one click and follow every application from applied to offer in real time.'
}];

const testimonials = [
{
  quote:
  'Wayfare Global surfaced a role I would never have found on my own — and I signed the offer two weeks later.',
  name: 'Priya Nair',
  role: 'Product Designer',
  avatar:
  'https://ui-avatars.com/api/?name=Priya+Nair&background=0d9488&color=fff&bold=true&size=96'
},
{
  quote:
  'The match scores were shockingly accurate. Every interview felt like a role I actually wanted.',
  name: 'Marcus Lee',
  role: 'Frontend Engineer',
  avatar:
  'https://ui-avatars.com/api/?name=Marcus+Lee&background=4f46e5&color=fff&bold=true&size=96'
},
{
  quote:
  'As a hiring manager, the pre-interview scorecards saved our team dozens of hours of manual screening.',
  name: 'Elena Rostova',
  role: 'Engineering Lead',
  avatar:
  'https://ui-avatars.com/api/?name=Elena+Rostova&background=7c3aed&color=fff&bold=true&size=96'
}
];

export function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [liveJobs, setLiveJobs] = useState<Job[]>([]);

  useEffect(() => {
    publicApi
      .getPublishedJobs()
      .then((jobs) =>
        setLiveJobs(
          jobs.map((p) => {
            const companyName = p.postedBy || p.organizationName || 'Company';
            const bg = stringToColor(companyName);
            const publishedMs = new Date(p.publishedAt).getTime();
            const postedDaysAgo = Math.max(1, Math.floor((Date.now() - publishedMs) / 86400000));
            return {
              id: p.id,
              title: p.title,
              company: companyName,
              companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=${bg}&color=fff&bold=true&size=128&format=png`,
              location: p.location,
              workMode: (p.employmentType === 'Remote' ? 'Remote' : 'On-site') as any,
              type: (EMPLOYMENT_TYPE_LABEL[p.employmentType] ?? 'Full-time') as any,
              level: 'Mid' as any,
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
              featured: true,
            } satisfies Job;
          })
        )
      )
      .catch(() => {/* silent on landing */});
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?q=${encodeURIComponent(query)}`);
  };

  // Show live jobs only, capped at 4
  const featured = liveJobs.slice(0, 4);
  const companyCount = new Set(
    liveJobs.map((j) => j.company).filter(Boolean)
  ).size;
  const remoteCount = liveJobs.filter(
    (j) => j.workMode === 'Remote' || j.location.toLowerCase().includes('remote')
  ).length;
  const liveStats = [
    {
      value: String(liveJobs.length),
      label: 'Open roles',
    },
    {
      value: String(companyCount),
      label: 'Companies hiring',
    },
    {
      value: String(remoteCount),
      label: 'Remote-friendly roles',
    },
    {
      value: featured.length ? String(featured.length) : '0',
      label: 'Featured this week',
    },
  ];
  const heroJob = liveJobs[0];
  return (
    <div className="w-full bg-slate-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
        {/* Ambient Mesh Orbs */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-1/4 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-10 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-24">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5
            }}>
            
            <Badge tone="brand" className="mb-5 bg-white/10 text-teal-300 border border-white/15 backdrop-blur-md px-3.5 py-1.5 shadow-sm">
              <SparklesIcon className="h-4 w-4 text-teal-300 animate-pulse" /> Next-Gen AI Recruitment
            </Badge>
            <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-white">
              Find the role you were{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-200 to-brand-300">
                made for.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300 leading-relaxed font-medium">
              Wayfare Global matches your skills and ambitions to thousands of live
              jobs — then helps you apply, interview, and land the offer faster.
            </p>

            <form
              onSubmit={submitSearch}
              className="mt-8 flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-2.5 shadow-2xl backdrop-blur-xl sm:flex-row">
              
              <div className="flex flex-1 items-center gap-2 px-3">
                <SearchIcon className="h-5 w-5 flex-shrink-0 text-slate-300" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job title, skill, or company"
                  className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none"
                  aria-label="Search jobs" />
                
              </div>
              <Button type="submit" size="lg" className="sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 rounded-xl shadow-lg shadow-brand-600/30">
                Search jobs
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Popular:</span>
              {['React', 'Product', 'Data', 'Remote'].map((tag) =>
              <Link
                key={tag}
                to={`/jobs?q=${tag}`}
                className="font-semibold text-teal-300 hover:text-white transition hover:underline">
                
                  {tag}
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{
              duration: 0.5,
              delay: 0.1
            }}
            className="relative">
            
            <div className="overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/10">
              <img
                src={HERO_IMG}
                alt="A team of professionals collaborating in a modern office"
                className="h-full w-full object-cover" />
              
            </div>
            <motion.div
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: 0.4
              }}
              className="absolute -bottom-5 -left-4 flex items-center gap-3.5 rounded-2xl border border-white/15 bg-slate-900/90 backdrop-blur-xl p-4 shadow-2xl sm:-left-6">
              
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md shadow-teal-500/20">
                <BrainCircuitIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">
                  {heroJob ? 'Live opening' : 'Start matching'}
                </p>
                <p className="text-xs text-slate-300 font-medium">
                  {heroJob
                    ? heroJob.title
                    : 'Publish roles to appear here'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
            {liveStats.map((s) =>
            <div key={s.label} className="text-center lg:text-left">
                <p className="font-display text-3xl font-black text-white tracking-tight">
                  {s.value}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-400">{s.label}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Logo marquee */}
      <section className="border-y border-slate-800 bg-slate-900/90 py-8 text-white">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Trusted by teams hiring at leading companies
        </p>
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-12 px-6">
            {[...companies, ...companies].map((c, i) =>
            <span
              key={i}
              className="whitespace-nowrap font-display text-lg font-bold text-slate-500 hover:text-slate-300 transition">
              
                {c}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="accent" className="mb-4 bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Why Wayfare Global
          </Badge>
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Everything you need to land your next role
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            A smarter job search powered by AI at every step — from discovery to
            offer.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) =>
          <motion.div
            key={f.title}
            initial={{
              opacity: 0,
              y: 16
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.4,
              delay: i * 0.05
            }}
            className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-2xl">
            
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {f.desc}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="brand" className="mb-4 bg-brand-500/20 text-brand-200 border border-brand-500/30">
              How it works
            </Badge>
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Land your next role in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) =>
            <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-lg shadow-brand-500/20">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-teal-400">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-300">
                  {step.desc}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge tone="accent" className="mb-4 bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Featured roles
            </Badge>
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Handpicked opportunities
            </h2>
          </div>
          <Button variant="outline" onClick={() => navigate('/jobs')} className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold">
            View all jobs <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {featured.length > 0 ? (
            featured.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/90 py-14 text-center text-white shadow-xl">
              <p className="font-semibold text-white">No live roles yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Published openings from recruiters will show up here.
              </p>
              <Button
                className="mt-5 bg-brand-600 hover:bg-brand-500 text-white font-bold"
                onClick={() => navigate('/jobs')}
              >
                Browse jobs
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-800 bg-slate-900/80 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="amber" className="mb-4 bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{' '}
              Loved by job seekers
            </Badge>
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Careers changed, one match at a time
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) =>
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl">
              
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {Array.from({
                  length: 5
                }).map((_, i) =>
                <StarIcon key={i} className="h-4 w-4 fill-current" />
                )}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-300">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <img
                  src={t.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full border border-slate-700" />
                
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 px-6 py-16 text-center shadow-2xl sm:px-16 border border-brand-500/20">
          {/* Ambient Mesh Orbs */}
          <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl pointer-events-none" />
          <div className="absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-teal-500/25 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-black text-white sm:text-4xl">
              Your next opportunity is one match away
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100/90 font-medium">
              Create a free profile and let AI do the heavy lifting on your job
              search.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-brand-900 hover:bg-brand-50 font-bold shadow-lg shadow-white/10">
                
                Create free account
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/jobs')}
                className="bg-brand-600 text-white font-bold border border-brand-400/30 hover:bg-brand-500 shadow-lg shadow-brand-600/30">
                
                Browse jobs
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>);

}