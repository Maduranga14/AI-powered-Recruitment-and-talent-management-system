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
    <div className="w-full bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-slate-900">
            Companies hiring now
          </h1>
          <p className="mt-2 max-w-xl text-slate-500">
            Explore the teams hiring on Talenta and discover live roles across
            departments.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2Icon className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="font-semibold text-slate-900">No companies hiring yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Published job openings will appear here as teams start hiring.
            </p>
            <Button className="mt-5" onClick={() => navigate('/jobs')}>
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
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={c.logo}
                    alt={`${c.name} logo`}
                    className="h-14 w-14 rounded-2xl ring-1 ring-slate-100"
                  />
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {c.name}
                    </h2>
                    <p className="text-sm font-medium text-brand-600">
                      {c.openRoles} open role{c.openRoles === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat} tone="accent">
                      {cat}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPinIcon className="h-4 w-4" /> {c.locations[0]}
                  {c.locations.length > 1 && ` +${c.locations.length - 1} more`}
                </p>
                <Button
                  variant="outline"
                  className="mt-5"
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
