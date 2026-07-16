import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2Icon, FilterIcon, SearchIcon } from 'lucide-react';
import type { AdminOrganization, OrganizationStatus } from '../../data/admin';
import { ORGANIZATION_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
interface AdminOrganizationsProps {
  organizations: AdminOrganization[];
  onOrganizationSelect: (organization: AdminOrganization) => void;
}
export function AdminOrganizations({
  organizations,
  onOrganizationSelect
}: AdminOrganizationsProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All statuses' | OrganizationStatus>(
    'All statuses');
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return organizations.filter(
      (organization) =>
      (!normalized ||
      [organization.name, organization.owner, organization.plan].
      join(' ').
      toLowerCase().
      includes(normalized)) && (
      statusFilter === 'All statuses' ||
      organization.status === statusFilter)
    );
  }, [organizations, query, statusFilter]);
  const clearFilters = () => {
    setQuery('');
    setStatusFilter('All statuses');
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      
      <div>
        <p className="text-sm font-medium text-slate-500">
          Workspace governance
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          Organizations
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor customer workspaces, service posture, and usage signals.
        </p>
      </div>
      <section
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5"
        aria-label="Organization filters">
        
        <div className="grid gap-3 md:grid-cols-[1fr_210px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workspace or owner"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              aria-label="Search organizations" />
            
          </label>
          <label className="relative">
            <span className="sr-only">Filter by organization status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
              setStatusFilter(
                event.target.value as 'All statuses' | OrganizationStatus
              )
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              
              <option>All statuses</option>
              <option>Healthy</option>
              <option>Review</option>
              <option>Restricted</option>
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-900">{visible.length}</strong>{' '}
          organizations shown
        </p>
        <button
          onClick={clearFilters}
          className="text-sm font-semibold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
          Clear filters
        </button>
      </div>
      {visible.length ?
      <section
        className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
        aria-label="Organizations">
        
          <div className="hidden grid-cols-[minmax(240px,1.4fr)_110px_120px_120px_130px_120px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Organization</span>
            <span>Plan</span>
            <span>Members</span>
            <span>Jobs</span>
            <span>Status</span>
            <span>Usage</span>
          </div>
          <div className="divide-y divide-slate-100">
            {visible.map((organization) =>
          <button
            key={organization.id}
            onClick={() => onOrganizationSelect(organization)}
            className="grid w-full gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 lg:grid-cols-[minmax(240px,1.4fr)_110px_120px_120px_130px_120px] lg:items-center lg:px-5">
            
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xs font-extrabold text-brand-700">
                    {organization.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-800">
                      {organization.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Owner: {organization.owner}
                    </span>
                  </span>
                </span>
                <span>
                  <Badge tone="brand">{organization.plan}</Badge>
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {organization.members}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {organization.activeJobs} active
                </span>
                <span>
                  <Badge tone={ORGANIZATION_TONES[organization.status]}>
                    {organization.status}
                  </Badge>
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {organization.monthlyUsage.split(' ')[0]}
                </span>
              </button>
          )}
          </div>
        </section> :

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <Building2Icon className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 font-semibold text-slate-900">
            No organizations match these filters
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Try another query or reset the workspace status.
          </p>
          <button
          onClick={clearFilters}
          className="mt-5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
            Reset filters
          </button>
        </div>
      }
    </motion.div>);

}