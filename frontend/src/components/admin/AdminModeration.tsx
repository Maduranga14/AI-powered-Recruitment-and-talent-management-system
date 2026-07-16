import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  FilterIcon,
  SearchIcon } from
'lucide-react';
import type { ModerationItem, ModerationStatus } from '../../data/admin';
import { MODERATION_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
interface AdminModerationProps {
  moderation: ModerationItem[];
  onItemSelect: (item: ModerationItem) => void;
}
export function AdminModeration({
  moderation,
  onItemSelect
}: AdminModerationProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All statuses' | ModerationStatus>(
    'Pending');
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return moderation.filter(
      (item) =>
      (!normalized ||
      [item.title, item.organization, item.reason, item.type].
      join(' ').
      toLowerCase().
      includes(normalized)) && (
      statusFilter === 'All statuses' || item.status === statusFilter)
    );
  }, [moderation, query, statusFilter]);
  const clearFilters = () => {
    setQuery('');
    setStatusFilter('Pending');
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
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Trust & safety</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Moderation
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review reported activity and new listings against platform
            standards.
          </p>
        </div>
        <Badge tone="amber">
          <ClipboardListIcon className="h-3.5 w-3.5" />{' '}
          {moderation.filter((item) => item.status === 'Pending').length}{' '}
          awaiting review
        </Badge>
      </div>
      <section
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5"
        aria-label="Moderation filters">
        
        <div className="grid gap-3 md:grid-cols-[1fr_210px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search listing, report, or organization"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              aria-label="Search moderation items" />
            
          </label>
          <label className="relative">
            <span className="sr-only">Filter by moderation status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
              setStatusFilter(
                event.target.value as 'All statuses' | ModerationStatus
              )
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              
              <option>Pending</option>
              <option>All statuses</option>
              <option>Approved</option>
              <option>Declined</option>
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-900">{visible.length}</strong> items
          shown
        </p>
        <button
          onClick={clearFilters}
          className="text-sm font-semibold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
          Reset filters
        </button>
      </div>
      {visible.length ?
      <section
        className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
        aria-label="Moderation queue">
        
          <div className="hidden grid-cols-[minmax(260px,1.5fr)_160px_150px_140px_110px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Item</span>
            <span>Organization</span>
            <span>Reason</span>
            <span>Submitted</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-slate-100">
            {visible.map((item) =>
          <button
            key={item.id}
            onClick={() => onItemSelect(item)}
            className="grid w-full gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 lg:grid-cols-[minmax(260px,1.5fr)_160px_150px_140px_110px] lg:items-center lg:px-5">
            
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.type === 'Report' ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'}`}>
                  
                      <ClipboardListIcon className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm font-bold text-slate-800">
                      {item.title}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {item.type} · submitted by {item.submittedBy}
                  </span>
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {item.organization}
                </span>
                <span className="text-xs text-slate-500">{item.reason}</span>
                <span className="text-xs font-medium text-slate-500">
                  {item.submittedAt}
                </span>
                <span>
                  <Badge tone={MODERATION_TONES[item.status]}>
                    {item.status}
                  </Badge>
                </span>
              </button>
          )}
          </div>
        </section> :

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <CheckCircle2Icon className="mx-auto h-10 w-10 text-emerald-300" />
          <h2 className="mt-3 font-semibold text-slate-900">
            The moderation queue is clear
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            No items match the current filters.
          </p>
          <button
          onClick={clearFilters}
          className="mt-5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          
            Show pending items
          </button>
        </div>
      }
    </motion.div>);

}