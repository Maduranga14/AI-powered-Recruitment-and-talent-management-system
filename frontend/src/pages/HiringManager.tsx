import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';
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
import { managerApi, type JobApplicant } from '../services/api';

const avatarUrl = (name: string, bg: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true&size=128&format=png`;

function toManagerCandidate(applicant: JobApplicant): ManagerCandidate {
  let recommendation: ManagerRecommendation | undefined = undefined;
  if (applicant.recommendation) {
    recommendation = applicant.recommendation as ManagerRecommendation;
  }

  let decisionStatus: any = 'Awaiting feedback';
  if (applicant.feedback) {
    decisionStatus = 'Feedback submitted';
  }

  const skills = applicant.skills || [];
  const signals = [
    `Matches requirement with skills: ${skills.slice(0, 3).join(', ') || 'General skills match'}`,
    applicant.experienceSummary ? `Experience: ${applicant.experienceSummary}` : 'Verified professional background'
  ];

  return {
    id: applicant.candidateProfileId,
    applicationId: applicant.applicationId,
    name: applicant.fullName,
    title: applicant.headline || 'Software Engineer',
    location: applicant.location || 'Remote',
    avatar: applicant.photoUrl || avatarUrl(applicant.fullName, '0d9488'),
    role: applicant.jobTitle,
    decisionStatus,
    matchScore: 88,
    skills,
    experience: applicant.experienceSummary || 'Not specified',
    applied: applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleDateString() : 'Recently',
    summary: applicant.coverLetter || 'No cover letter provided.',
    signals,
    interviewFocus: 'Technical coding, architectural skills, department alignment.',
    recommendation,
    evidence: applicant.feedback || undefined,
    overallRating: applicant.overallRating || undefined,
    skillRatings: applicant.skillRatings || undefined,
  };
}

export function HiringManager() {
  const [view, setView] = useState<HiringManagerView>('overview');
  const [candidates, setCandidates] = useState<ManagerCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<ManagerCandidate | null>(null);
  const [feedbackCandidateId, setFeedbackCandidateId] = useState<string | null>(
    null
  );
  const [feedback, setFeedback] = useState('');

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const list = await managerApi.getApplicants();
      const mapped = list.map(toManagerCandidate);
      setCandidates(mapped);
    } catch (err: any) {
      console.error('Failed to load manager applicants, using mock fallback:', err);
      setCandidates(MANAGER_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2800);
  };

  const openFeedback = (candidateId: string) => {
    setSelectedCandidate(null);
    setFeedbackCandidateId(candidateId);
    setView('feedback');
  };

  const submitFeedback = async (
    candidateId: string,
    recommendation: ManagerRecommendation,
    evidence: string,
    overallRating: number,
    skillRatingsJson: string
  ) => {
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!candidate) return;

    if (candidateId.startsWith('manager-candidate-') || !candidate.applicationId) {
      setCandidates((current) =>
        current.map((item) =>
          item.id === candidateId
            ? {
                ...item,
                decisionStatus: 'Feedback submitted',
                recommendation,
                evidence,
                overallRating,
                skillRatings: skillRatingsJson,
              }
            : item
        )
      );
      showFeedback(`${candidate.name} feedback shared with the hiring team.`);
      setView('candidates');
      return;
    }

    try {
      await managerApi.submitFeedback(candidate.applicationId, {
        recommendation,
        feedback: evidence,
        overallRating,
        skillRatings: skillRatingsJson,
      });

      await loadCandidates();
      showFeedback(`${candidate.name} feedback shared with the hiring team.`);
      setView('candidates');
    } catch (err: any) {
      showFeedback(err?.message ?? 'Failed to submit feedback.');
    }
  };

  const selectCandidate = (candidate: ManagerCandidate) =>
    setSelectedCandidate(candidate);

  return (
    <HiringManagerShell activeView={view} onViewChange={setView}>
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2Icon className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            {view === 'overview' && (
              <HiringManagerOverview
                candidates={candidates}
                interviews={MANAGER_INTERVIEWS}
                roles={MANAGER_ROLES}
                onViewChange={setView}
                onCandidateSelect={selectCandidate}
              />
            )}
            {view === 'candidates' && (
              <HiringManagerCandidates
                candidates={candidates}
                onCandidateSelect={selectCandidate}
              />
            )}
            {view === 'feedback' && (
              <HiringManagerFeedback
                candidates={candidates}
                initialCandidateId={feedbackCandidateId}
                onSubmitFeedback={submitFeedback}
              />
            )}
            {view === 'calendar' && (
              <HiringManagerCalendar
                interviews={MANAGER_INTERVIEWS}
                onOpenFeedback={openFeedback}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <ManagerCandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onGiveFeedback={openFeedback}
      />
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            role="status"
            className="fixed bottom-20 left-4 right-4 z-[60] flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto"
          >
            <CheckCircle2Icon className="h-4 w-4 text-accent-400" />
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </HiringManagerShell>
  );
}