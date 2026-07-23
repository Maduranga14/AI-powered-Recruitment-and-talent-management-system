import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinIcon, ArrowRightIcon, Loader2Icon } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { publicApi, type PublicJob } from '../services/api';

interface CompanySummary {
  name: string;
  logo: string;
  openRoles: number;
  categories: string[];
  locations: string[];
}

function stringToColor(str: string): string {
  const colors = ['4f46e5', '0d9488', '7c3aed', 'db2777', 'ea580c', '2563eb', '0284c7'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function buildCompanies(jobs: PublicJob[]): CompanySummary[] {
  const map = new Map<string, CompanySummary>();
  for (const job of jobs) {
    const name = job.postedBy || job.organizationName || 'Company';
    const bg = stringToColor(name);
    const logo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true&size=128&format=png`;
    const category = job.departmentName ?? 'General';
    const existing = map.get(name);
    if (existing) {
      existing.openRoles += 1;
      if (!existing.categories.includes(category)) existing.categories.push(category);
      if (!existing.locations.includes(job.location)) existing.locations.push(job.location);
    } else {
      map.set(name, {
        name,
        logo,
        openRoles: 1,
        categories: [category],
        locations: [job.location],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.openRoles - a.openRoles);
}

export function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .getPublishedJobs()
      .then((jobs) => setCompanies(buildCompanies(jobs)))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full bg-slate-950 text-white min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white border-b border-slate-800">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl pointer-events-none" />
        <div className="absolute right-10 -bottom-10 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Badge tone="brand" className="mb-3 bg-white/10 text-teal-300 border border-white/15 backdrop-blur-md px-3 py-1">
            Featured Companies
          </Badge>
          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl text-white">
            Companies hiring now
          </h1>
          <p className="mt-2 max-w-xl text-slate-300 font-medium">
            Explore the teams hiring on Talenta and discover live roles across
            departments.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2Icon className="h-8 w-8 animate-spin text-teal-400" />
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 py-16 text-center shadow-xl text-white">
            <p className="font-semibold text-white">No companies hiring yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Published job openings will appear here as teams start hiring.
            </p>
            <Button className="mt-5 bg-brand-600 hover:bg-brand-500 text-white font-bold" onClick={() => navigate('/jobs')}>
              Browse jobs
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c, i) => (
              <motion.article
                key={c.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl text-white transition-all hover:-translate-y-1 hover:border-brand-500/50"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={c.logo}
                    alt={`${c.name} logo`}
                    className="h-14 w-14 rounded-2xl ring-1 ring-slate-700 object-cover"
                  />
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-white">
                      {c.name}
                    </h2>
                    <p className="text-sm font-bold text-teal-300">
                      {c.openRoles} open role{c.openRoles === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat} tone="accent" className="bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {cat}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPinIcon className="h-4 w-4" /> {c.locations[0]}
                  {c.locations.length > 1 && ` +${c.locations.length - 1} more`}
                </p>
                <Button
                  variant="outline"
                  className="mt-5 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                  onClick={() =>
                    navigate(`/jobs?q=${encodeURIComponent(c.name)}`)
                  }
                >
                  View jobs <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
