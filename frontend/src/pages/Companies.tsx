import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinIcon, ArrowRightIcon } from 'lucide-react';
import { JOBS } from '../data/jobs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
interface CompanySummary {
  name: string;
  logo: string;
  openRoles: number;
  categories: string[];
  locations: string[];
}
function buildCompanies(): CompanySummary[] {
  const map = new Map<string, CompanySummary>();
  for (const job of JOBS) {
    const existing = map.get(job.company);
    if (existing) {
      existing.openRoles += 1;
      if (!existing.categories.includes(job.category))
      existing.categories.push(job.category);
      if (!existing.locations.includes(job.location))
      existing.locations.push(job.location);
    } else {
      map.set(job.company, {
        name: job.company,
        logo: job.companyLogo,
        openRoles: 1,
        categories: [job.category],
        locations: [job.location]
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.openRoles - a.openRoles);
}
export function Companies() {
  const navigate = useNavigate();
  const companies = buildCompanies();
  return (
    <div className="w-full bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-slate-900">
            Companies hiring now
          </h1>
          <p className="mt-2 max-w-xl text-slate-500">
            Explore the teams building on Talenta and discover roles across
            engineering, design, data, and more.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c, i) =>
          <motion.article
            key={c.name}
            initial={{
              opacity: 0,
              y: 14
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.35,
              delay: i * 0.04
            }}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
            
              <div className="flex items-center gap-4">
                <img
                src={c.logo}
                alt={`${c.name} logo`}
                className="h-14 w-14 rounded-2xl ring-1 ring-slate-100" />
              
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    {c.name}
                  </h2>
                  <p className="text-sm font-medium text-brand-600">
                    {c.openRoles} open roles
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.categories.slice(0, 3).map((cat) =>
              <Badge key={cat} tone="accent">
                    {cat}
                  </Badge>
              )}
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
              }>
              
                View jobs <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </motion.article>
          )}
        </div>
      </div>
    </div>);

}