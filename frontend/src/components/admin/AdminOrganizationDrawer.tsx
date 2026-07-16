import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2Icon, UsersRoundIcon, XIcon } from 'lucide-react';
import type { AdminOrganization } from '../../data/admin';
import { ORGANIZATION_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
interface AdminOrganizationDrawerProps {
  organization: AdminOrganization | null;
  onClose: () => void;
}
export function AdminOrganizationDrawer({
  organization,
  onClose
}: AdminOrganizationDrawerProps) {
  return (
    <AnimatePresence>
      {organization &&
      <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          onClick={onClose}
          aria-label="Close organization details"
          className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]" />
        
          <motion.aside
          initial={{
            x: '100%'
          }}
          animate={{
            x: 0
          }}
          exit={{
            x: '100%'
          }}
          transition={{
            type: 'tween',
            duration: 0.24
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="organization-drawer-title"
          className="relative h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
          
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-slate-700">
                Workspace details
              </p>
              <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close organization details">
              
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 font-display text-lg font-extrabold text-brand-700">
                  {organization.initials}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                    id="organization-drawer-title"
                    className="font-display text-2xl font-extrabold">
                    
                      {organization.name}
                    </h2>
                    <Badge tone={ORGANIZATION_TONES[organization.status]}>
                      {organization.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Joined {organization.joined} · Owner: {organization.owner}
                  </p>
                  <div className="mt-3">
                    <Badge tone="brand">{organization.plan} plan</Badge>
                  </div>
                </div>
              </div>
              <section className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <UsersRoundIcon className="h-5 w-5 text-accent-600" />
                  <p className="mt-3 font-display text-2xl font-extrabold">
                    {organization.members}
                  </p>
                  <p className="text-xs text-slate-500">Members</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <Building2Icon className="h-5 w-5 text-brand-600" />
                  <p className="mt-3 font-display text-2xl font-extrabold">
                    {organization.activeJobs}
                  </p>
                  <p className="text-xs text-slate-500">Active jobs</p>
                </div>
              </section>
              <section className="mt-7 rounded-2xl border border-slate-200 p-5">
                <h3 className="font-display text-base font-bold">
                  Usage posture
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {organization.monthlyUsage}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                  className={`h-full rounded-full ${organization.status === 'Review' ? 'w-[91%] bg-amber-400' : organization.status === 'Restricted' ? 'w-[20%] bg-red-400' : 'w-[64%] bg-accent-500'}`} />
                
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Usage is shown for operational context only.
                </p>
              </section>
              <Button
              fullWidth
              variant="outline"
              className="mt-7"
              onClick={onClose}>
              
                Close details
              </Button>
            </div>
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}