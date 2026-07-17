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
import { JOBS, type Job } from '../data/jobs';
import { publicApi } from '../services/api';

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

const stats = [
{
  value: '48k+',
  label: 'Open roles'
},
{
  value: '12k+',
  label: 'Companies hiring'
},
{
  value: '96%',
  label: 'Match accuracy'
},
{
  value: '3.2d',
  label: 'Avg. time to interview'
}];

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
  'Talenta surfaced a role I would never have found on my own — and I signed the offer two weeks later.',
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
  'Tracking everything in one dashboard removed all the anxiety from my job search. Game changer.',
  name: 'Sofia Alvarez',
  role: 'Data Analyst',
  avatar:
  'https://ui-avatars.com/api/?name=Sofia+Alvarez&background=db2777&color=fff&bold=true&size=96'
}];

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
              salaryMin: p.salaryMin ?? 0,
              salaryMax: p.salaryMax ?? 0,
              postedDaysAgo,
              category: p.departmentName ?? 'General',
              skills: p.requiredSkills,
              shortDescription: p.description.slice(0, 300),
              responsibilities: [],
              requirements: p.requiredSkills,
              benefits: [],
              applicants: 0,
              matchScore: 75,
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

  // Live jobs first, then static featured, capped at 4 total
  const featured = [
    ...liveJobs,
    ...JOBS.filter((j) => j.featured),
    ...JOBS.filter((j) => !j.featured),
  ].slice(0, 4);
  return (
    <div className="w-full bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-20">
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
            
            <Badge tone="brand" className="mb-5">
              <SparklesIcon className="h-3.5 w-3.5" /> AI-powered recruitment
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find the role you were{' '}
              <span className="text-brand-600">made</span> for.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              Talenta matches your skills and ambitions to thousands of live
              jobs — then helps you apply, interview, and land the offer faster.
            </p>

            <form
              onSubmit={submitSearch}
              className="mt-8 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft sm:flex-row">
              
              <div className="flex flex-1 items-center gap-2 px-3">
                <SearchIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job title, skill, or company"
                  className="w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  aria-label="Search jobs" />
                
              </div>
              <Button type="submit" size="lg" className="sm:w-auto">
                Search jobs
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="font-medium">Popular:</span>
              {['React', 'Product', 'Data', 'Remote'].map((tag) =>
              <Link
                key={tag}
                to={`/jobs?q=${tag}`}
                className="font-medium text-brand-600 hover:underline">
                
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
            
            <div className="overflow-hidden rounded-3xl shadow-lift ring-1 ring-slate-200">
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
              className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-lift sm:-left-6">
              
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <BrainCircuitIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">94% match</p>
                <p className="text-xs text-slate-500">
                  Senior Frontend Engineer
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((s) =>
            <div key={s.label} className="text-center lg:text-left">
                <p className="font-display text-3xl font-extrabold text-slate-900">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Logo marquee */}
      <section className="border-y border-slate-100 bg-white py-8">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Trusted by teams hiring at leading companies
        </p>
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-12 px-6">
            {[...companies, ...companies].map((c, i) =>
            <span
              key={i}
              className="whitespace-nowrap font-display text-lg font-bold text-slate-300">
              
                {c}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="accent" className="mb-4">
            Why Talenta
          </Badge>
          <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Everything you need to land your next role
          </h2>
          <p className="mt-4 text-lg text-slate-600">
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
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift">
            
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.desc}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="brand" className="mb-4">
              How it works
            </Badge>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Land your next role in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) =>
            <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lift">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-brand-500">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">
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
            <Badge tone="accent" className="mb-4">
              Featured roles
            </Badge>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Handpicked opportunities
            </h2>
          </div>
          <Button variant="outline" onClick={() => navigate('/jobs')}>
            View all jobs <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {featured.map((job) =>
          <JobCard key={job.id} job={job} />
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="amber" className="mb-4">
              <StarIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{' '}
              Loved by job seekers
            </Badge>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Careers changed, one match at a time
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) =>
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {Array.from({
                  length: 5
                }).map((_, i) =>
                <StarIcon key={i} className="h-4 w-4 fill-current" />
                )}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-700">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <img
                  src={t.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full" />
                
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-16 text-center shadow-lift sm:px-16">
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold text-white sm:text-4xl">
              Your next opportunity is one match away
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Create a free profile and let AI do the heavy lifting on your job
              search.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-brand-700 hover:bg-brand-50">
                
                Create free account
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/jobs')}
                className="bg-brand-600 text-white ring-1 ring-inset ring-brand-400 hover:bg-brand-500">
                
                Browse jobs
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>);

}