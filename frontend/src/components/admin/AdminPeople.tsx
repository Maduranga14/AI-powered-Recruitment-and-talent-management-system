import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FilterIcon, SearchIcon, UserRoundXIcon } from 'lucide-react';
import type { AccountStatus, AdminPerson, AdminRole } from '../../data/admin';
import { ACCOUNT_TONES, ROLE_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
interface AdminPeopleProps {
  people: AdminPerson[];
  onPersonSelect: (person: AdminPerson) => void;
}
export function AdminPeople({ people, onPersonSelect }: AdminPeopleProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All roles' | AdminRole>(
    'All roles'
  );
  const [statusFilter, setStatusFilter] = useState<
    'All statuses' | AccountStatus>(
    'All statuses');
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return people.filter(
      (person) =>
      (!normalized ||
      [person.name, person.email, person.organization, person.role].
      join(' ').
      toLowerCase().
      includes(normalized)) && (
      roleFilter === 'All roles' || person.role === roleFilter) && (
      statusFilter === 'All statuses' || person.status === statusFilter)
    );
  }, [people, query, roleFilter, statusFilter]);
  const clearFilters = () => {
    setQuery('');
    setRoleFilter('All roles');
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
        <p className="text-sm font-medium text-slate-500">Account governance</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          People
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Search platform accounts and take local, documented account actions.
        </p>
      </div>
      <section
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5"
        aria-label="People filters">
        
        <div className="grid gap-3 lg:grid-cols-[1fr_210px_190px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, or organization"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              aria-label="Search people" />
            
          </label>
          <label className="relative">
            <span className="sr-only">Filter by role</span>
            <select
              value={roleFilter}
              onChange={(event) =>
              setRoleFilter(event.target.value as 'All roles' | AdminRole)
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              
              <option>All roles</option>
              <option>Candidate</option>
              <option>Recruiter</option>
              <option>Hiring manager</option>
              <option>Administrator</option>
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by account status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
              setStatusFilter(
                event.target.value as 'All statuses' | AccountStatus
              )
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              
              <option>All statuses</option>
              <option>Active</option>
              <option>Suspended</option>
              <option>Invited</option>
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-900">{visible.length}</strong> people
          shown
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
        aria-label="People directory">
        
          <div className="hidden grid-cols-[minmax(260px,1.4fr)_150px_160px_150px_130px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Person</span>
            <span>Role</span>
            <span>Organization</span>
            <span>Status</span>
            <span>Last active</span>
          </div>
          <div className="divide-y divide-slate-100">
            {visible.map((person) =>
          <button
            key={person.id}
            onClick={() => onPersonSelect(person)}
            className="grid w-full gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 lg:grid-cols-[minmax(260px,1.4fr)_150px_160px_150px_130px] lg:items-center lg:px-5">
            
                <span className="flex min-w-0 items-center gap-3">
                  <img
                src={person.avatar}
                alt=""
                className="h-10 w-10 rounded-xl" />
              
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-800">
                      {person.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {person.email}
                    </span>
                  </span>
                </span>
                <span>
                  <Badge tone={ROLE_TONES[person.role]}>{person.role}</Badge>
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {person.organization}
                </span>
                <span>
                  <Badge tone={ACCOUNT_TONES[person.status]}>
                    {person.status}
                  </Badge>
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {person.lastActive}
                </span>
              </button>
          )}
          </div>
        </section> :

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <UserRoundXIcon className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 font-semibold text-slate-900">
            No accounts match these filters
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Try another search or reset the filters.
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