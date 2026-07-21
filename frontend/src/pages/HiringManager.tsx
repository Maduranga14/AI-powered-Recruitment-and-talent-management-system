import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { HiringManagerCalendar } from '../components/hiring-manager/HiringManagerCalendar';
import { ManagerCandidateDrawer } from '../components/hiring-manager/ManagerCandidateDrawer';
import { HiringManagerCandidates } from '../components/hiring-manager/HiringManagerCandidates';
import { HiringManagerFeedback } from '../components/hiring-manager/HiringManagerFeedback';
import { HiringManagerOverview } from '../components/hiring-manager/HiringManagerOverview';
import {
  HiringManagerShell,
  type HiringManagerView,
} from '../components/hiring-manager/HiringManagerShell';
import type {
  ManagerCandidate,
  ManagerInterview,
  ManagerRecommendation,
  ManagerRole,
} from '../data/hiringManager';
import {
  managerApi,
  type InterviewDto,
  type JobApplicant,
} from '../services/api';

const avatarUrl = (name: string, bg: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true&size=128&format=png`;

function toManagerCandidate(applicant: JobApplicant): ManagerCandidate {
  let recommendation: ManagerRecommendation | undefined = undefined;
  if (applicant.recommendation) {
    recommendation = applicant.recommendation as ManagerRecommendation;
  }

  let decisionStatus: ManagerCandidate['decisionStatus'] = 'Awaiting feedback';
  if (applicant.feedback) {
    decisionStatus = 'Feedback submitted';
  }

  const skills = applicant.skills || [];
  const signals = [
    `Matches requirement with skills: ${skills.slice(0, 3).join(', ') || 'General skills match'}`,
    applicant.experienceSummary
      ? `Experience: ${applicant.experienceSummary}`
      : 'Verified professional background',
  ];

  return {
    id: applicant.candidateProfileId,
    applicationId: applicant.applicationId,
    name: applicant.fullName,
    title: applicant.headline || 'Applicant',
    location: applicant.location || 'Remote',
    avatar: applicant.photoUrl || avatarUrl(applicant.fullName, '0d9488'),
    role: applicant.jobTitle,
    decisionStatus,
    matchScore: 0,
    skills,
    experiences: (applicant.experiences || []).map(e => ({
      title: e.title,
      company: e.company,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
      description: e.description,
    })),
    educations: (applicant.educations || []).map(e => ({
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startDate: e.startDate,
      endDate: e.endDate,
    })),
    experience: applicant.experienceSummary || 'Not specified',
    applied: applicant.appliedAt
      ? new Date(applicant.appliedAt).toLocaleDateString()
      : 'Recently',
    summary: applicant.coverLetter || 'No cover letter provided.',
    signals,
    interviewFocus:
      'Technical depth, role alignment, and team collaboration.',
    recommendation,
    evidence: applicant.feedback || undefined,
    overallRating: applicant.overallRating || undefined,
    skillRatings: applicant.skillRatings || undefined,
    email: applicant.email,
    status: applicant.status,
    departmentName: applicant.departmentName || undefined,
    appliedAt: applicant.appliedAt,
    coverLetter: applicant.coverLetter || undefined,
    resumeUrl: applicant.resumeUrl || undefined,
  };
}


function formatInterviewTime(iso: string): string {
  const at = new Date(iso);
  const now = new Date();
  const sameDay = at.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = at.toDateString() === tomorrow.toDateString();
  const time = at.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (sameDay) return `Today · ${time}`;
  if (isTomorrow) return `Tomorrow · ${time}`;
  return `${at.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} · ${time}`;
}

function toManagerInterview(item: InterviewDto): ManagerInterview {
  return {
    id: item.id,
    candidateId: item.applicationId,
    candidate: item.candidateName,
    role: item.jobTitle,
    time: formatInterviewTime(item.scheduledAt),
    duration: `${item.durationMinutes} min`,
    format: item.interviewType,
    focus: item.notes || `${item.interviewType} interview with ${item.interviewerName}`,
    avatar: avatarUrl(item.candidateName, '0d9488'),
    meetingLink: item.meetingLink,
    scheduledAt: item.scheduledAt,
    rescheduleRequested: item.rescheduleRequested,
    rescheduleReason: item.rescheduleReason,
    feedbackSubmitted: item.hasFeedback ?? !!item.feedbackSubmittedAt,
  };
}

function deriveRoles(candidates: ManagerCandidate[]): ManagerRole[] {
  const map = new Map<string, ManagerRole>();
  for (const c of candidates) {
    const existing = map.get(c.role);
    const awaiting = c.decisionStatus === 'Awaiting feedback' ? 1 : 0;
    if (existing) {
      existing.awaitingDecisions += awaiting;
      if (awaiting) existing.stage = 'Needs decisions';
    } else {
      map.set(c.role, {
        id: `role-${c.role.toLowerCase().replace(/\s+/g, '-')}`,
        title: c.role,
        team: 'Your department',
        openSeats: 1,
        awaitingDecisions: awaiting,
        stage: awaiting ? 'Needs decisions' : 'On track',
      });
    }
  }
  return Array.from(map.values());
}

export function HiringManager() {
  const [view, setView] = useState<HiringManagerView>('overview');
  const [candidates, setCandidates] = useState<ManagerCandidate[]>([]);
  const [interviews, setInterviews] = useState<ManagerInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<ManagerCandidate | null>(null);
  const [feedbackCandidateId, setFeedbackCandidateId] = useState<string | null>(
    null
  );
  const [feedback, setFeedback] = useState('');

  const roles = useMemo(() => deriveRoles(candidates), [candidates]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, interviewList] = await Promise.all([
        managerApi.getApplicants(),
        managerApi.getInterviews().catch(() => [] as InterviewDto[]),
      ]);
      setCandidates(list.map(toManagerCandidate));
      setInterviews(interviewList.map(toManagerInterview));
    } catch (err) {
      console.error('Failed to load manager data:', err);
      setCandidates([]);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    if (!candidate?.applicationId) {
      showFeedback('Unable to submit feedback for this candidate.');
      return;
    }

    try {
      await managerApi.submitFeedback(candidate.applicationId, {
        recommendation,
        feedback: evidence,
        overallRating,
        skillRatings: skillRatingsJson,
      });

      await loadData();
      showFeedback(`${candidate.name} feedback shared with the hiring team.`);
      setView('candidates');
    } catch (err: unknown) {
      showFeedback(
        err instanceof Error ? err.message : 'Failed to submit feedback.'
      );
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
                interviews={interviews}
                roles={roles}
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
                interviews={interviews}
                onOpenFeedback={openFeedback}
                onRescheduleRequested={loadData}
                onFeedbackSubmitted={loadData}
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
