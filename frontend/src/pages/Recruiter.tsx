import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, XIcon } from 'lucide-react';
import { CandidateDrawer } from '../components/recruiter/CandidateDrawer';
import { RecruiterCandidates } from '../components/recruiter/RecruiterCandidates';
import { RecruiterInbox } from '../components/recruiter/RecruiterInbox';
import { RecruiterJobs } from '../components/recruiter/RecruiterJobs';
import { RecruiterOverview } from '../components/recruiter/RecruiterOverview';
import { RecruiterSchedule } from '../components/recruiter/RecruiterSchedule';
import {
  RecruiterShell,
  type RecruiterView } from
'../components/recruiter/RecruiterShell';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import {
  RECRUITER_CANDIDATES,
  RECRUITER_INTERVIEWS,
  RECRUITER_JOBS,
  RECRUITER_MESSAGES,
  type RecruiterCandidate,
  type RecruiterStage } from
'../data/recruiter';
export function Recruiter() {
  const [view, setView] = useState<RecruiterView>('overview');
  const [candidates, setCandidates] = useState(RECRUITER_CANDIDATES);
  const [jobs, setJobs] = useState(RECRUITER_JOBS);
  const [selectedCandidate, setSelectedCandidate] =
  useState<RecruiterCandidate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2800);
  };
  const updateStage = (candidateId: string, stage: RecruiterStage) => {
    setCandidates((current) =>
    current.map((candidate) =>
    candidate.id === candidateId ?
    {
      ...candidate,
      stage
    } :
    candidate
    )
    );
    setSelectedCandidate((current) =>
    current?.id === candidateId ?
    {
      ...current,
      stage
    } :
    current
    );
    const candidate = candidates.find((item) => item.id === candidateId);
    showFeedback(`${candidate?.name ?? 'Candidate'} moved to ${stage}.`);
  };
  const openSchedule = (candidate?: RecruiterCandidate) => {
    setView('schedule');
    showFeedback(
      candidate ?
      `Scheduling flow opened for ${candidate.name}.` :
      'Scheduling flow opened — choose a candidate and time.'
    );
  };
  const selectCandidate = (candidate: RecruiterCandidate) => {
    setSelectedCandidate(candidate);
  };
  const toggleJobStatus = (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    setJobs((current) =>
    current.map((item) =>
    item.id === jobId ?
    { ...item, status: item.status === 'Active' ? 'Paused' : 'Active' } :
    item
    )
    );
    showFeedback(
      `${job?.title ?? 'Job'} ${job?.status === 'Active' ? 'paused' : 'resumed'}.`
    );
  };
  return (
    <RecruiterShell
      activeView={view}
      onViewChange={setView}
      onCreateJob={() => setCreateOpen(true)}>
      
      {view === 'overview' &&
      <RecruiterOverview
        candidates={candidates}
        jobs={jobs}
        interviews={RECRUITER_INTERVIEWS}
        onViewChange={setView}
        onCandidateSelect={selectCandidate} />

      }
      {view === 'jobs' &&
      <RecruiterJobs
        jobs={jobs}
        onCreateJob={() => setCreateOpen(true)}
        onSchedule={() => openSchedule()}
        onStatusChange={toggleJobStatus}
        onViewApplicants={() => {
          setView('candidates');
          showFeedback('Showing candidates across your open roles.');
        }} />

      }
      {view === 'candidates' &&
      <RecruiterCandidates
        candidates={candidates}
        onCandidateSelect={selectCandidate}
        onStageChange={updateStage} />

      }
      {view === 'schedule' &&
      <RecruiterSchedule
        interviews={RECRUITER_INTERVIEWS}
        onSchedule={() => openSchedule()} />

      }
      {view === 'inbox' && <RecruiterInbox messages={RECRUITER_MESSAGES} />}

      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onStageChange={updateStage}
        onSchedule={openSchedule} />
      
      <CreateJobModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setView('jobs');
          showFeedback(
            'Draft job created. Add details when you are ready to publish.'
          );
        }} />
      
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
    </RecruiterShell>);

}
function CreateJobModal({
  open,
  onClose,
  onCreated




}: {open: boolean;onClose: () => void;onCreated: () => void;}) {
  const [title, setTitle] = useState('');
  const [team, setTeam] = useState('Product Engineering');
  const canCreate = title.trim().length > 2;
  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
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
          className="absolute inset-0 w-full bg-slate-900/45 backdrop-blur-sm"
          aria-label="Close create job dialog" />
        
          <motion.div
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: 24
          }}
          transition={{
            type: 'tween',
            duration: 0.2
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-job-title"
          className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
          
            <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Close">
            
              <XIcon className="h-5 w-5" />
            </button>
            <h2
            id="create-job-title"
            className="font-display text-xl font-extrabold">
            
              Create a job
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Start a new draft to build your hiring pipeline.
            </p>
            <div className="mt-6 space-y-4">
              <Input
              label="Job title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Senior Product Designer"
              autoFocus />
            
              <Select
              label="Team"
              value={team}
              onChange={(event) => setTeam(event.target.value)}>
              
                <option>Product Engineering</option>
                <option>Design</option>
                <option>Data & AI</option>
                <option>Growth</option>
              </Select>
              <Input label="Location" placeholder="e.g. Remote · US" />
            </div>
            <div className="mt-7 flex gap-3">
              <Button fullWidth variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button fullWidth disabled={!canCreate} onClick={onCreated}>
                Create draft
              </Button>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}