import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon } from 'lucide-react';
import { HiringManagerCalendar } from '../components/hiring-manager/HiringManagerCalendar';
import { ManagerCandidateDrawer } from '../components/hiring-manager/ManagerCandidateDrawer';
import { HiringManagerCandidates } from '../components/hiring-manager/HiringManagerCandidates';
import { HiringManagerFeedback } from '../components/hiring-manager/HiringManagerFeedback';
import { HiringManagerOverview } from '../components/hiring-manager/HiringManagerOverview';
import {
  HiringManagerShell,
  type HiringManagerView } from
'../components/hiring-manager/HiringManagerShell';
import {
  MANAGER_CANDIDATES,
  MANAGER_INTERVIEWS,
  MANAGER_ROLES,
  type ManagerCandidate,
  type ManagerRecommendation } from
'../data/hiringManager';
export function HiringManager() {
  const [view, setView] = useState<HiringManagerView>('overview');
  const [candidates, setCandidates] = useState(MANAGER_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] =
  useState<ManagerCandidate | null>(null);
  const [feedbackCandidateId, setFeedbackCandidateId] = useState<string | null>(
    null
  );
  const [feedback, setFeedback] = useState('');
  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2800);
  };
  const openFeedback = (candidateId: string) => {
    setSelectedCandidate(null);
    setFeedbackCandidateId(candidateId);
    setView('feedback');
  };
  const submitFeedback = (
  candidateId: string,
  recommendation: ManagerRecommendation,
  evidence: string) =>
  {
    const candidate = candidates.find((item) => item.id === candidateId);
    setCandidates((current) =>
    current.map((item) =>
    item.id === candidateId ?
    {
      ...item,
      decisionStatus: 'Feedback submitted',
      recommendation,
      evidence
    } :
    item
    )
    );
    showFeedback(
      `${candidate?.name ?? 'Candidate'} feedback shared with the hiring team.`
    );
  };
  const selectCandidate = (candidate: ManagerCandidate) =>
  setSelectedCandidate(candidate);
  return (
    <HiringManagerShell activeView={view} onViewChange={setView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.16
          }}>
          
          {view === 'overview' &&
          <HiringManagerOverview
            candidates={candidates}
            interviews={MANAGER_INTERVIEWS}
            roles={MANAGER_ROLES}
            onViewChange={setView}
            onCandidateSelect={selectCandidate} />

          }
          {view === 'candidates' &&
          <HiringManagerCandidates
            candidates={candidates}
            onCandidateSelect={selectCandidate} />

          }
          {view === 'feedback' &&
          <HiringManagerFeedback
            candidates={candidates}
            initialCandidateId={feedbackCandidateId}
            onSubmitFeedback={submitFeedback} />

          }
          {view === 'calendar' &&
          <HiringManagerCalendar
            interviews={MANAGER_INTERVIEWS}
            onOpenFeedback={openFeedback} />

          }
        </motion.div>
      </AnimatePresence>
      <ManagerCandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onGiveFeedback={openFeedback} />
      
      <AnimatePresence>
        {feedback &&
        <motion.div
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: 12
          }}
          role="status"
          className="fixed bottom-20 left-4 right-4 z-[60] flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto">
          
            <CheckCircle2Icon className="h-4 w-4 text-accent-400" />
            {feedback}
          </motion.div>
        }
      </AnimatePresence>
    </HiringManagerShell>);

}