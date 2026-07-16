import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarClockIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  XIcon } from
'lucide-react';
import type { AdminPerson } from '../../data/admin';
import { ACCOUNT_TONES, ROLE_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
interface AdminPersonDrawerProps {
  person: AdminPerson | null;
  onClose: () => void;
  onToggleStatus: (person: AdminPerson) => void;
}
export function AdminPersonDrawer({
  person,
  onClose,
  onToggleStatus
}: AdminPersonDrawerProps) {
  return (
    <AnimatePresence>
      {person &&
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
          aria-label="Close account details"
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
          aria-labelledby="person-drawer-title"
          className="relative h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
          
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-slate-700">
                Account details
              </p>
              <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close account details">
              
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <img
                src={person.avatar}
                alt=""
                className="h-16 w-16 rounded-2xl" />
              
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                    id="person-drawer-title"
                    className="font-display text-2xl font-extrabold text-slate-900">
                    
                      {person.name}
                    </h2>
                    <Badge tone={ACCOUNT_TONES[person.status]}>
                      {person.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{person.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={ROLE_TONES[person.role]}>{person.role}</Badge>
                    <Badge tone="slate">{person.organization}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                variant={person.status === 'Suspended' ? 'primary' : 'danger'}
                onClick={() => onToggleStatus(person)}>
                
                  {person.status === 'Suspended' ?
                <ShieldCheckIcon className="h-4 w-4" /> :

                <ShieldAlertIcon className="h-4 w-4" />
                }
                  {person.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
              <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <CalendarClockIcon className="h-4 w-4 text-slate-400" />{' '}
                  Account timeline
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Joined</dt>
                    <dd className="font-semibold text-slate-700">
                      {person.joined}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Last active</dt>
                    <dd className="font-semibold text-slate-700">
                      {person.lastActive}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Workspace</dt>
                    <dd className="font-semibold text-slate-700">
                      {person.organization}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="mt-7 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                <h3 className="font-display text-sm font-bold">
                  Local action notice
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Suspension and reactivation are mock-only actions for this
                  admin interface. They do not affect authentication or platform
                  access.
                </p>
              </section>
            </div>
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}