import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2Icon, UsersRoundIcon, XIcon, GlobeIcon, ShieldCheckIcon, FileTextIcon } from 'lucide-react';
import type { AdminOrganization } from '../../data/admin';
import { ORGANIZATION_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RecruiterDepartments } from '../recruiter/RecruiterDepartments';

interface ExtendedAdminOrganization extends AdminOrganization {
  taxNumber?: string;
  website?: string | null;
  shortDescription?: string | null;
  logoUrl?: string | null;
}

interface AdminOrganizationDrawerProps {
  organization: ExtendedAdminOrganization | null;
  onClose: () => void;
}

export function AdminOrganizationDrawer({
  organization,
  onClose
}: AdminOrganizationDrawerProps) {
  return (
    <AnimatePresence>
      {organization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close organization details"
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-modal-title"
            className="relative z-10 w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-slate-700/90 bg-slate-900 text-white p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-teal-300 border border-brand-500/30">
                  <Building2Icon className="h-5 w-5" />
                </span>
                <p className="text-base font-bold text-white">
                  Workspace & Company Details
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Close organization details"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </header>

            <div className="mt-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {organization.logoUrl ? (
                  <img
                    src={organization.logoUrl}
                    alt={organization.name}
                    className="h-16 w-16 rounded-2xl object-contain border border-slate-800 p-1 bg-slate-950 shadow-md"
                  />
                ) : (
                  <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-500/20 text-teal-300 border border-brand-500/30 font-display text-xl font-extrabold">
                    {organization.initials}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="organization-modal-title"
                      className="font-display text-2xl font-extrabold text-white"
                    >
                      {organization.name}
                    </h2>
                    <Badge tone={ORGANIZATION_TONES[organization.status]}>
                      {organization.status}
                    </Badge>
                  </div>

                  <p className="mt-1 text-xs text-slate-300">
                    Joined {organization.joined} · Owner: <span className="font-semibold text-white">{organization.owner}</span>
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Badge tone="brand" className="bg-brand-500/20 text-teal-300 border border-brand-500/30">{organization.plan} plan</Badge>
                    {organization.taxNumber && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-400" /> Verified Tax ID: {organization.taxNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Website & Description */}
              {(organization.website || organization.shortDescription) && (
                <section className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
                  {organization.website && (
                    <div className="flex items-center gap-2">
                      <GlobeIcon className="h-4 w-4 text-teal-400" />
                      <a
                        href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-teal-300 hover:underline"
                      >
                        {organization.website}
                      </a>
                    </div>
                  )}
                  {organization.shortDescription && (
                    <div className="flex items-start gap-2 pt-1">
                      <FileTextIcon className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-slate-300 font-medium">{organization.shortDescription}</p>
                    </div>
                  )}
                </section>
              )}

              <section className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
                  <UsersRoundIcon className="h-5 w-5 text-accent-400" />
                  <p className="mt-3 font-display text-2xl font-extrabold text-white">
                    {organization.members}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">Assigned Members</p>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
                  <Building2Icon className="h-5 w-5 text-teal-400" />
                  <p className="mt-3 font-display text-2xl font-extrabold text-white">
                    {organization.activeJobs}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">Active Live Roles</p>
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <h3 className="font-display text-sm font-bold text-white">
                  Usage Posture
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  {organization.monthlyUsage}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${organization.status === 'Review' ? 'w-[91%] bg-amber-400' : organization.status === 'Restricted' ? 'w-[20%] bg-red-400' : 'w-[64%] bg-accent-500'}`}
                  />
                </div>
              </section>

              <div className="mt-7 border-t border-slate-800 pt-6">
                <RecruiterDepartments organizationName={organization.name} />
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6 rounded-xl font-bold border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}