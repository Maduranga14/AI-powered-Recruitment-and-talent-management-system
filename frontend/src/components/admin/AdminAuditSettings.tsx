import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, HistoryIcon, ShieldCheckIcon } from 'lucide-react';
import type { AuditEvent } from '../../data/admin';
import { Badge } from '../ui/Badge';
interface AdminAuditSettingsProps {
  auditEvents: AuditEvent[];
  settings: {
    reviewAlerts: boolean;
    strictSafeguards: boolean;
  };
  onToggle: (setting: 'reviewAlerts' | 'strictSafeguards') => void;
}
export function AdminAuditSettings({
  auditEvents,
  settings,
  onToggle
}: AdminAuditSettingsProps) {
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
      className="mx-auto max-w-[1280px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      
      <div>
        <p className="text-sm font-medium text-slate-500">
          Governance controls
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          Audit & settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Review sensitive platform activity and tune local safeguards.
        </p>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          aria-labelledby="audit-title">
          
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <HistoryIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 id="audit-title" className="font-display text-lg font-bold">
                  Audit timeline
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  A local record of representative governance events.
                </p>
              </div>
            </div>
          </div>
          <ol className="divide-y divide-slate-100">
            {auditEvents.map((event) =>
            <li key={event.id} className="flex gap-4 p-5 sm:p-6">
                <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${event.tone === 'red' ? 'bg-red-500' : event.tone === 'amber' ? 'bg-amber-400' : event.tone === 'green' ? 'bg-emerald-500' : 'bg-brand-500'}`} />
              
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">
                      {event.action}
                    </p>
                    <Badge tone={event.tone}>{event.time}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{event.detail}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    Actor: {event.actor}
                  </p>
                </div>
              </li>
            )}
          </ol>
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-accent-100 bg-accent-50/60 p-5 shadow-soft sm:p-6">
            <ShieldCheckIcon className="h-5 w-5 text-accent-600" />
            <h2 className="mt-3 font-display text-lg font-bold">
              Local safeguards
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These controls demonstrate the governance experience only; changes
              remain in this session.
            </p>
            <div className="mt-5 space-y-4">
              <SettingToggle
                label="Review queue alerts"
                detail="Keep moderation attention visible in the workspace."
                checked={settings.reviewAlerts}
                onChange={() => onToggle('reviewAlerts')} />
              
              <SettingToggle
                label="Strict session safeguards"
                detail="Use a more cautious risk posture for new sessions."
                checked={settings.strictSafeguards}
                onChange={() => onToggle('strictSafeguards')} />
              
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold">
                  Control posture
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  All scheduled safeguard checks are passing in this local
                  preview.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </motion.div>);

}
function SettingToggle({
  label,
  detail,
  checked,
  onChange





}: {label: string;detail: string;checked: boolean;onChange: () => void;}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-accent-100 bg-white/80 p-4">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${checked ? 'bg-accent-600' : 'bg-slate-300'}`}>
        
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        
      </button>
    </div>);

}