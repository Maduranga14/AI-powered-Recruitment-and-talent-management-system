import React from 'react';
import { motion } from 'framer-motion';
import {
  ActivityIcon,
  ArrowRightIcon,
  Building2Icon,
  FileCheck2Icon,
  ShieldCheckIcon,
  UsersRoundIcon } from
'lucide-react';
import type {
  AdminOrganization,
  AdminPerson,
  ModerationItem } from
'../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
interface AdminOverviewProps {
  people: AdminPerson[];
  organizations: AdminOrganization[];
  moderation: ModerationItem[];
  onViewChange: (
  view: 'people' | 'organizations' | 'moderation' | 'audit-settings')
  => void;
}
export function AdminOverview({
  people,
  organizations,
  moderation,
  onViewChange
}: AdminOverviewProps) {
  const pending = moderation.filter((item) => item.status === 'Pending');
  const metrics = [
  {
    label: 'People on platform',
    value: '12,842',
    detail: '+6.4% this month',
    icon: UsersRoundIcon,
    tone: 'brand'
  },
  {
    label: 'Active organizations',
    value: organizations.length + 138,
    detail: '98.8% in good standing',
    icon: Building2Icon,
    tone: 'accent'
  },
  {
    label: 'Open moderation',
    value: pending.length,
    detail: 'Oldest item: 2 hours',
    icon: FileCheck2Icon,
    tone: 'amber'
  },
  {
    label: 'Platform availability',
    value: '99.98%',
    detail: 'No active incidents',
    icon: ShieldCheckIcon,
    tone: 'blue'
  }];

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
      
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Thursday, May 16 · Operations snapshot
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Platform overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Monitor trust, activity, and the operational work that keeps Talenta
            dependable.
          </p>
        </div>
        <Button onClick={() => onViewChange('moderation')}>
          <FileCheck2Icon className="h-4 w-4" /> Review moderation
        </Button>
      </div>
      <section
        aria-label="Platform metrics"
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
        {metrics.map(({ label, value, detail, icon: Icon, tone }, index) =>
        <motion.article
          key={label}
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.04
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          
            <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'brand' ? 'bg-brand-50 text-brand-600' : tone === 'accent' ? 'bg-accent-50 text-accent-600' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
            
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-extrabold text-slate-900">
              {value}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </motion.article>
        )}
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          aria-labelledby="review-queue-title">
          
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div>
              <h2
                id="review-queue-title"
                className="font-display text-lg font-bold">
                
                Moderation queue
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Listings and reports awaiting a platform decision.
              </p>
            </div>
            <button
              onClick={() => onViewChange('moderation')}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
              View queue <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pending.slice(0, 3).map((item) =>
            <button
              key={item.id}
              onClick={() => onViewChange('moderation')}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-6">
              
                <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.type === 'Report' ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'}`}>
                
                  <FileCheck2Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {item.organization} · {item.submittedAt}
                  </span>
                </span>
                <Badge tone="amber">Pending</Badge>
              </button>
            )}
          </div>
        </section>
        <aside
          className="rounded-2xl border border-accent-100 bg-accent-50/60 p-5 shadow-soft sm:p-6"
          aria-labelledby="security-title">
          
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white">
            <ShieldCheckIcon className="h-5 w-5" />
          </span>
          <h2
            id="security-title"
            className="mt-5 font-display text-lg font-bold">
            
            Security pulse
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Safeguards are working normally. One elevated login pattern was
            verified and resolved this morning.
          </p>
          <div className="mt-5 rounded-xl border border-accent-100 bg-white/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Risk controls
              </span>
              <Badge tone="green">Healthy</Badge>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-accent-100">
              <motion.div
                initial={{
                  width: 0
                }}
                animate={{
                  width: '94%'
                }}
                transition={{
                  duration: 0.45
                }}
                className="h-full rounded-full bg-accent-500" />
              
            </div>
            <p className="mt-2 text-xs text-slate-500">
              94% of scheduled control checks completed today.
            </p>
          </div>
          <button
            onClick={() => onViewChange('audit-settings')}
            className="mt-5 text-sm font-bold text-accent-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            
            Open safeguards
          </button>
        </aside>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="activity-title">
          
          <div className="flex items-start justify-between">
            <div>
              <h2
                id="activity-title"
                className="font-display text-lg font-bold">
                
                Recent platform activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                The latest governance and workspace events.
              </p>
            </div>
            <ActivityIcon className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-5 space-y-4">
            {[
            'New Growth organization joined: Hue & Co',
            'Account review completed for Priya Nair',
            'Vantage AI usage reached 91% of monthly allowance'].
            map((event, index) =>
            <div key={event} className="flex gap-3">
                <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${index === 1 ? 'bg-amber-400' : 'bg-accent-500'}`} />
              
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {event}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {index === 0 ?
                  '12 minutes ago' :
                  index === 1 ?
                  '1 hour ago' :
                  '3 hours ago'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="usage-title">
          
          <h2 id="usage-title" className="font-display text-lg font-bold">
            Usage pulse
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A steady week across customer workspaces.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-display text-xl font-extrabold">1,284</p>
              <p className="mt-1 text-xs text-slate-500">Active sessions</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-display text-xl font-extrabold">428</p>
              <p className="mt-1 text-xs text-slate-500">Jobs reviewed</p>
            </div>
          </div>
          <button
            onClick={() => onViewChange('organizations')}
            className="mt-5 text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            
            View organizations
          </button>
        </section>
      </div>
    </motion.div>);

}