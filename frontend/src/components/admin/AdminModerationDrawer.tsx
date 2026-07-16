import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, FileCheck2Icon, ShieldXIcon, XIcon } from 'lucide-react';
import type { ModerationItem } from '../../data/admin';
import { MODERATION_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
interface AdminModerationDrawerProps {
  item: ModerationItem | null;
  onClose: () => void;
  onDecision: (item: ModerationItem, status: 'Approved' | 'Declined') => void;
}
export function AdminModerationDrawer({
  item,
  onClose,
  onDecision
}: AdminModerationDrawerProps) {
  return (
    <AnimatePresence>
      {item &&
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
          aria-label="Close moderation review"
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
          aria-labelledby="moderation-drawer-title"
          className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
          
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-slate-700">
                Moderation review
              </p>
              <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close moderation review">
              
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.type === 'Report' ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'}`}>
                
                  <FileCheck2Icon className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                    id="moderation-drawer-title"
                    className="font-display text-2xl font-extrabold">
                    
                      {item.title}
                    </h2>
                    <Badge tone={MODERATION_TONES[item.status]}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.type} · {item.organization}
                  </p>
                </div>
              </div>
              <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Submitted by</dt>
                    <dd className="font-semibold text-slate-700">
                      {item.submittedBy}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Submitted</dt>
                    <dd className="font-semibold text-slate-700">
                      {item.submittedAt}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Review reason</dt>
                    <dd className="text-right font-semibold text-slate-700">
                      {item.reason}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="mt-7">
                <h3 className="font-display text-base font-bold">
                  Review context
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.detail}
                </p>
              </section>
              {item.status === 'Pending' ?
            <section className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="font-display text-base font-bold">
                    Record a decision
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    This updates local state only and writes no external
                    changes.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button onClick={() => onDecision(item, 'Approved')}>
                      <CheckIcon className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                  variant="danger"
                  onClick={() => onDecision(item, 'Declined')}>
                  
                      <ShieldXIcon className="h-4 w-4" /> Decline
                    </Button>
                  </div>
                </section> :

            <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    This item has already been {item.status.toLowerCase()} in
                    this local session.
                  </p>
                </section>
            }
            </div>
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}