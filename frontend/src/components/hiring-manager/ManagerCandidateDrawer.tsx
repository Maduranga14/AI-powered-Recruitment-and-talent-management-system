import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightIcon,
  BrainCircuitIcon,
  CalendarClockIcon,
  MapPinIcon,
  XIcon } from
'lucide-react';
import type { ManagerCandidate } from '../../data/hiringManager';
import { DECISION_TONES } from '../../data/hiringManager';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScore } from '../ui/MatchScore';
interface ManagerCandidateDrawerProps {
  candidate: ManagerCandidate | null;
  onClose: () => void;
  onGiveFeedback: (candidateId: string) => void;
}
export function ManagerCandidateDrawer({
  candidate,
  onClose,
  onGiveFeedback
}: ManagerCandidateDrawerProps) {
  return (
    <AnimatePresence>
      {candidate &&
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
          aria-label="Close candidate details"
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
          aria-label={`${candidate.name} profile`}
          className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
          
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-slate-700">
                Candidate brief
              </p>
              <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close candidate profile">
              
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <img
                src={candidate.avatar}
                alt=""
                className="h-16 w-16 rounded-2xl" />
              
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl font-extrabold text-slate-900">
                      {candidate.name}
                    </h2>
                    <Badge tone={DECISION_TONES[candidate.decisionStatus]}>
                      {candidate.decisionStatus}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {candidate.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPinIcon className="h-4 w-4" />
                    {candidate.location}
                  </p>
                </div>
                <MatchScore score={candidate.matchScore} size={58} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button onClick={() => onGiveFeedback(candidate.id)}>
                  <BrainCircuitIcon className="h-4 w-4" /> Give feedback
                </Button>
                <Button variant="outline" onClick={onClose}>
                  <ArrowRightIcon className="h-4 w-4" /> Back to list
                </Button>
              </div>
              {candidate.interviewTime &&
            <section className="mt-6 flex gap-3 rounded-2xl border border-accent-100 bg-accent-50/60 p-4">
                  <CalendarClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Interview context
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {candidate.interviewTime}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {candidate.interviewFocus}
                    </p>
                  </div>
                </section>
            }
              <section className="mt-7">
                <h3 className="font-display text-base font-bold">
                  Profile snapshot
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {candidate.summary}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {candidate.experience}
                </p>
              </section>
              <section className="mt-7">
                <h3 className="font-display text-base font-bold">
                  Key signals
                </h3>
                <ul className="mt-3 space-y-3">
                  {candidate.signals.map((signal) =>
                <li
                  key={signal}
                  className="flex gap-3 text-sm leading-6 text-slate-600">
                  
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                      {signal}
                    </li>
                )}
                </ul>
              </section>
              <section className="mt-7 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                <div className="flex items-center gap-2">
                  <BrainCircuitIcon className="h-5 w-5 text-brand-600" />
                  <h3 className="font-display text-sm font-bold">
                    Recommended interview focus
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {candidate.interviewFocus}
                </p>
              </section>
              <section className="mt-7">
                <h3 className="font-display text-base font-bold">Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) =>
                <Badge key={skill} tone="brand">
                      {skill}
                    </Badge>
                )}
                </div>
              </section>
              {candidate.evidence &&
            <section className="mt-7 border-t border-slate-100 pt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold">
                      Submitted decision
                    </h3>
                    {candidate.recommendation &&
                <Badge
                  tone={
                  candidate.recommendation === 'Advance' ?
                  'green' :
                  candidate.recommendation === 'Hold' ?
                  'amber' :
                  'red'
                  }>
                  
                        {candidate.recommendation}
                      </Badge>
                }
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {candidate.evidence}
                  </p>
                </section>
            }
            </div>
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}