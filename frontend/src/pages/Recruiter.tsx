import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, XIcon, Loader2Icon } from 'lucide-react';
import { CandidateDrawer } from '../components/recruiter/CandidateDrawer';
import { RecruiterCandidates } from '../components/recruiter/RecruiterCandidates';
import { RecruiterInbox } from '../components/recruiter/RecruiterInbox';
import { RecruiterJobs } from '../components/recruiter/RecruiterJobs';
import { RecruiterOverview } from '../components/recruiter/RecruiterOverview';
import { RecruiterSchedule } from '../components/recruiter/RecruiterSchedule';
import { RecruiterHiringManagers } from '../components/recruiter/RecruiterHiringManagers';
import { RecruiterDepartments } from '../components/recruiter/RecruiterDepartments';
import { ScheduleInterviewModal } from '../components/recruiter/ScheduleInterviewModal';
import {
  RecruiterShell,
  type RecruiterView,
} from '../components/recruiter/RecruiterShell';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import {
  RECRUITER_MESSAGES,
  type RecruiterCandidate,
  type RecruiterInterview,
  type RecruiterJob,
  type RecruiterStage,
} from '../data/recruiter';
import {
  recruiterApi,
  EmploymentTypeMap,
  type InterviewDto,
  type JobApplicant,
  type JobPostingListItem,
  type DepartmentDto,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_ORIGIN = 'http://localhost:5073';

/** Backend ApplicationStatus enum → pipeline stage */
function statusToStage(status: string): RecruiterStage {
  switch (status) {
    case 'UnderReview':
      return 'Shortlisted';
    case 'Reviewed':
      return 'Reviewed';
    case 'Interview':
      return 'Interview';
    case 'Hired':
      return 'Offer';
    case 'Rejected':
      return 'Rejected';
    case 'Applied':
    default:
      return 'New';
  }
}

/** Pipeline stage → backend ApplicationStatus numeric value */
function stageToStatus(stage: RecruiterStage): number {
  switch (stage) {
    case 'Screening':
    case 'Shortlisted':
      return 1; // UnderReview
    case 'Reviewed':
      return 5; // Reviewed status index 5 in backend
    case 'Interview':
      return 2;
    case 'Rejected':
      return 3;
    case 'Offer':
      return 4; // Hired
    case 'New':
    default:
      return 0; // Applied
  }
}

function formatAppliedAt(iso: string): string {
  const applied = new Date(iso);
  const diffMs = Date.now() - applied.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return applied.toLocaleDateString();
}

function avatarFor(name: string, photoUrl?: string | null): string {
  if (photoUrl) {
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${API_ORIGIN}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d9488&color=fff&bold=true&size=128&format=png`;
}

function toRecruiterCandidate(applicant: JobApplicant, jobId?: string): RecruiterCandidate {
  const name = applicant.fullName || 'Candidate';
  const resolvedJobId = jobId || applicant.jobPostingId;
  return {
    id: applicant.applicationId,
    name,
    title: applicant.headline || 'Applicant',
    location: applicant.location || '—',
    avatar: avatarFor(name, applicant.photoUrl),
    role: applicant.jobTitle,
    stage: statusToStage(applicant.status),
    matchScore: 0,
    skills: applicant.skills ?? [],
    experience: applicant.experienceSummary || 'No experience listed',
    applied: formatAppliedAt(applicant.appliedAt),
    rationale: applicant.coverLetter?.trim()
      ? applicant.coverLetter.trim()
      : 'Application submitted through TalentPortal.',
    summary: applicant.headline || `${name} applied for ${applicant.jobTitle}.`,
    notes: '',
    email: applicant.email,
    applicationId: applicant.applicationId,
    jobId: resolvedJobId,
    resumeUrl: applicant.resumeUrl,
    candidateProfileId: applicant.candidateProfileId,
    recommendation: applicant.recommendation,
    feedback: applicant.feedback,
    overallRating: applicant.overallRating,
    skillRatings: applicant.skillRatings,
  };
}

function toRecruiterJob(item: JobPostingListItem): RecruiterJob {
  const postedDate = item.publishedAt ?? item.createdAt;
  const diffMs = Date.now() - new Date(postedDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const posted =
    diffDays === 0
      ? 'Posted today'
      : diffDays === 1
        ? 'Posted yesterday'
        : `Posted ${diffDays} days ago`;

  return {
    id: item.id,
    title: item.title,
    team: item.departmentName ?? 'General',
    location: item.location,
    status: item.status === 'Published' ? 'Active' : 'Paused',
    applicants: item.applicantCount ?? 0,
    screened: item.screenedCount ?? 0,
    shortlisted: item.shortlistedCount ?? 0,
    interviews: item.interviewCount ?? 0,
    target: 1,
    posted,
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

function toRecruiterInterview(item: InterviewDto): RecruiterInterview {
  return {
    id: item.id,
    candidateId: item.applicationId,
    candidate: item.candidateName,
    role: item.jobTitle,
    time: formatInterviewTime(item.scheduledAt),
    duration: `${item.durationMinutes} min`,
    interviewer: item.interviewerName,
    type: item.interviewType,
    avatar: avatarFor(item.candidateName, item.photoUrl),
    scheduledAt: item.scheduledAt,
    meetingLink: item.meetingLink,
    location: item.location,
    jobPostingId: item.jobPostingId,
    applicationId: item.applicationId,
    durationMinutes: item.durationMinutes,
    notes: item.notes,
    rescheduleRequested: item.rescheduleRequested,
    rescheduleReason: item.rescheduleReason,
  };
}

export function Recruiter() {
  const [view, setView] = useState<RecruiterView>('overview');
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>([]);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [interviews, setInterviews] = useState<RecruiterInterview[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedJobFilter, setSelectedJobFilter] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<RecruiterCandidate | null>(null);
  const [scheduleCandidate, setScheduleCandidate] =
    useState<RecruiterCandidate | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [rescheduleInterview, setRescheduleInterview] =
    useState<RecruiterInterview | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  
  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const res = await recruiterApi.getMyJobs();
      setJobs(res.items.map(toRecruiterJob));
    } catch {
      
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const fetchAllApplicants = useCallback(async () => {
    setApplicantsLoading(true);
    try {
      const applicants = await recruiterApi.getAllApplicants();
      setCandidates(applicants.map((a) => toRecruiterCandidate(a)));
    } catch {
      setCandidates([]);
    } finally {
      setApplicantsLoading(false);
    }
  }, []);

  const fetchInterviews = useCallback(async () => {
    setInterviewsLoading(true);
    try {
      const items = await recruiterApi.getInterviews();
      setInterviews(items.map(toRecruiterInterview));
    } catch {
      setInterviews([]);
    } finally {
      setInterviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchInterviews();
  }, [fetchJobs, fetchInterviews]);

  // Load real applicants whenever the Candidates tab is opened (no job filter)
  useEffect(() => {
    if (view === 'candidates' && !selectedJobFilter) {
      fetchAllApplicants();
    }
  }, [view, selectedJobFilter, fetchAllApplicants]);

  useEffect(() => {
    if (view === 'schedule') {
      fetchInterviews();
    }
    if (view === 'overview' && candidates.length === 0) {
      fetchAllApplicants();
    }
  }, [view, fetchInterviews, fetchAllApplicants, candidates.length]);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2800);
  };

  const viewApplicantsForJob = async (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    setSelectedJobFilter({ id: jobId, title: job?.title ?? 'this role' });
    setView('candidates');
    setApplicantsLoading(true);
    try {
      const res = await recruiterApi.getJobApplicants(jobId);
      setCandidates(res.applicants.map((a) => toRecruiterCandidate(a, jobId)));
      setSelectedJobFilter({ id: res.jobId, title: res.jobTitle });
      showFeedback(
        res.applicants.length
          ? `Showing ${res.applicants.length} applicant${res.applicants.length === 1 ? '' : 's'} for “${res.jobTitle}”.`
          : `No applicants yet for “${res.jobTitle}”.`
      );
    } catch (err: unknown) {
      setCandidates([]);
      showFeedback(
        err instanceof Error ? err.message : 'Failed to load applicants.'
      );
    } finally {
      setApplicantsLoading(false);
    }
  };

  const clearJobFilter = () => {
    setSelectedJobFilter(null);
    // fetchAllApplicants runs via useEffect when selectedJobFilter becomes null
  };

  const updateStage = async (candidateId: string, stage: RecruiterStage) => {
    const candidate = candidates.find((item) => item.id === candidateId);

    setCandidates((current) =>
      current.map((c) => (c.id === candidateId ? { ...c, stage } : c))
    );
    setSelectedCandidate((current) =>
      current?.id === candidateId ? { ...current, stage } : current
    );

    if (candidate?.applicationId && candidate.jobId) {
      try {
        await recruiterApi.updateApplicantStatus(
          candidate.jobId,
          candidate.applicationId,
          stageToStatus(stage)
        );
        fetchJobs();
      } catch {
        showFeedback('Could not save stage change. Please try again.');
        return;
      }
    }

    showFeedback(`${candidate?.name ?? 'Candidate'} moved to ${stage}.`);
  };

  const openSchedule = async (candidate?: RecruiterCandidate) => {
    setRescheduleInterview(null);
    setScheduleCandidate(candidate ?? null);
    if (!candidate && candidates.length === 0) {
      await fetchAllApplicants();
    }
    setScheduleOpen(true);
    if (candidate) {
      setSelectedCandidate(null);
    }
  };

  const openReschedule = (interview: RecruiterInterview) => {
    setScheduleCandidate(null);
    setRescheduleInterview(interview);
    setScheduleOpen(true);
  };

  const handleInterviewScheduled = (candidateId: string) => {
    const wasReschedule = !!rescheduleInterview;
    setCandidates((current) =>
      current.map((c) =>
        c.id === candidateId || c.applicationId === candidateId
          ? { ...c, stage: 'Interview' as RecruiterStage }
          : c
      )
    );
    setSelectedCandidate((current) =>
      current?.id === candidateId || current?.applicationId === candidateId
        ? { ...current, stage: 'Interview' }
        : current
    );
    setRescheduleInterview(null);
    fetchInterviews();
    fetchJobs();
    setView('schedule');
    showFeedback(
      wasReschedule
        ? 'Interview rescheduled — candidate notified by email.'
        : 'Interview scheduled — candidate notified by email.'
    );
  };

  const toggleJobStatus = async (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;

    // Active (Published = 1) -> Pause it to Closed (2)
    // Paused (Closed = 2 or Draft = 0) -> Resume it to Published (1)
    const nextStatus = job.status === 'Active' ? 2 : 1;

    try {
      await recruiterApi.updateJobStatus(jobId, nextStatus);
      setJobs((current) =>
        current.map((item) =>
          item.id === jobId
            ? { ...item, status: nextStatus === 1 ? 'Active' : 'Paused' }
            : item
        )
      );
      showFeedback(
        `"${job.title}" status successfully changed to ${
          nextStatus === 1 ? 'Active' : 'Paused'
        }.`
      );
    } catch (err: any) {
      showFeedback(err?.message ?? 'Failed to update job status.');
    }
  };

  const [editingJob, setEditingJob] = useState<RecruiterJob | null>(null);

  const handleJobUpdated = (updatedJob: RecruiterJob) => {
    setJobs((current) =>
      current.map((j) => (j.id === updatedJob.id ? updatedJob : j))
    );
    setEditingJob(null);
    showFeedback(`"${updatedJob.title}" successfully updated.`);
  };

  const handleDeleteJob = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    if (jobId.startsWith('mock-') || !jobId.includes('-')) {
      setJobs((current) => current.filter((j) => j.id !== jobId));
      showFeedback(`"${job.title}" successfully deleted.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the job posting "${job.title}"?`)) {
      return;
    }

    try {
      await recruiterApi.deleteJob(jobId);
      setJobs((current) => current.filter((j) => j.id !== jobId));
      showFeedback(`"${job.title}" successfully deleted.`);
    } catch (err: any) {
      showFeedback(err?.message ?? 'Failed to delete job.');
    }
  };

  const handleJobCreated = (newJob: RecruiterJob) => {
    
    setJobs((current) => [newJob, ...current]);
    setCreateOpen(false);
    setView('jobs');
    showFeedback(`"${newJob.title}" created and added to your jobs.`);
  };

  const { user } = useAuth();

  return (
    <RecruiterShell
      activeView={view}
      onViewChange={(next) => {
        if (next !== 'candidates') {
          setSelectedJobFilter(null);
        }
        setView(next);
      }}
      onCreateJob={() => setCreateOpen(true)}
    >
      {view === 'overview' && (
        <RecruiterOverview
          candidates={candidates}
          jobs={jobs}
          interviews={interviews}
          onViewChange={setView}
          onCandidateSelect={(c) => setSelectedCandidate(c)}
        />
      )}
      {view === 'jobs' && (
        <RecruiterJobs
          jobs={jobs}
          interviews={interviews}
          loading={jobsLoading}
          onCreateJob={() => setCreateOpen(true)}
          onSchedule={() => openSchedule()}
          onStatusChange={toggleJobStatus}
          onViewApplicants={viewApplicantsForJob}
          onEditJob={(j) => setEditingJob(j)}
          onDeleteJob={handleDeleteJob}
        />
      )}
      {view === 'candidates' && (
        <RecruiterCandidates
          candidates={candidates}
          loading={applicantsLoading}
          jobTitle={selectedJobFilter?.title}
          onCandidateSelect={(c) => setSelectedCandidate(c)}
          onStageChange={updateStage}
          onClearJobFilter={selectedJobFilter ? clearJobFilter : undefined}
        />
      )}
      {view === 'hiring-managers' && (
        <RecruiterHiringManagers />
      )}
      {view === 'departments' && (
        <RecruiterDepartments jobs={jobs} />
      )}
      {view === 'schedule' && (
        <RecruiterSchedule
          interviews={interviews}
          loading={interviewsLoading}
          onSchedule={() => openSchedule()}
          onReschedule={openReschedule}
        />
      )}
      {view === 'inbox' && <RecruiterInbox messages={RECRUITER_MESSAGES} />}

      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onStageChange={updateStage}
        onSchedule={openSchedule}
      />

      <ScheduleInterviewModal
        open={scheduleOpen}
        candidate={scheduleCandidate}
        candidates={candidates}
        rescheduleInterview={rescheduleInterview}
        defaultInterviewer={user?.name ?? ''}
        onClose={() => {
          setScheduleOpen(false);
          setScheduleCandidate(null);
          setRescheduleInterview(null);
        }}
        onScheduled={handleInterviewScheduled}
      />

      <CreateJobModal
        open={createOpen || editingJob !== null}
        onClose={() => {
          setCreateOpen(false);
          setEditingJob(null);
        }}
        onCreated={handleJobCreated}
        onUpdated={handleJobUpdated}
        defaultPostedBy={user?.organizationName ?? ''}
        editingJob={editingJob}
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
    </RecruiterShell>
  );
}

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (job: RecruiterJob) => void;
  onUpdated?: (job: RecruiterJob) => void;
  defaultPostedBy?: string;
  editingJob?: RecruiterJob | null;
}

function CreateJobModal({
  open,
  onClose,
  onCreated,
  onUpdated,
  defaultPostedBy = '',
  editingJob = null
}: CreateJobModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [title, setTitle] = useState('');
  const [postedBy, setPostedBy] = useState(defaultPostedBy);
  const [employmentType, setEmploymentType] = useState('FullTime');
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState<'onsite' | 'remote' | 'hybrid'>('onsite');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);

  // Step 2
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skills, setSkills] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [salaryPublic, setSalaryPublic] = useState(true);
  const [deadline, setDeadline] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStep(1);
      setTitle('');
      setPostedBy(defaultPostedBy);
      setEmploymentType('FullTime');
      setLocation('');
      setLocationType('onsite');
      setDepartmentId('');
      setDepartments([]);
      setDescription('');
      setRequirements('');
      setSkills('');
      setSalaryMin('');
      setSalaryMax('');
      setSalaryCurrency('USD');
      setSalaryPublic(true);
      setDeadline('');
      setError('');
      setLoading(false);

      recruiterApi.getDepartments().then((res) => {
        setDepartments(res.departments || []);
      }).catch((err) => {
        console.error('Failed to load departments:', err);
      });

      if (editingJob) {
        setLoading(true);
        if (editingJob.id.startsWith('mock-') || !editingJob.id.includes('-')) {
          setTimeout(() => {
            setTitle(editingJob.title);
            setLocationType('remote');
            setLocation('');
            setEmploymentType('FullTime');
            setDepartmentId('');
            setDescription('This is a mock job posting for testing purposes.');
            setRequirements('Mock requirements list.');
            setSkills('React, TypeScript');
            setSalaryMin('80000');
            setSalaryMax('120000');
            setSalaryCurrency('USD');
            setSalaryPublic(true);
            setLoading(false);
          }, 300);
          return;
        }

        recruiterApi.getJobDetails(editingJob.id)
          .then((detail) => {
            setTitle(detail.title);
            setPostedBy(detail.recruiterName || defaultPostedBy);
            
            // Map location back
            if (detail.location === 'Remote') {
              setLocationType('remote');
              setLocation('');
            } else if (detail.location.endsWith(' - Hybrid') || detail.location === 'Hybrid') {
              setLocationType('hybrid');
              setLocation(detail.location.replace(' - Hybrid', ''));
            } else {
              setLocationType('onsite');
              setLocation(detail.location === 'On-site' ? '' : detail.location);
            }

            setEmploymentType(detail.employmentType || 'FullTime');
            setDepartmentId(detail.departmentId || '');
            
            // Parse description and requirements
            const parts = (detail.description || '').split('\n\nRequirements:\n');
            setDescription(parts[0] || '');
            setRequirements(parts[1] || '');
            
            setSkills(detail.requiredSkills || '');
            setSalaryMin(detail.salaryMin !== null ? detail.salaryMin.toString() : '');
            setSalaryMax(detail.salaryMax !== null ? detail.salaryMax.toString() : '');
            setSalaryCurrency(detail.salaryCurrency || 'USD');
            setSalaryPublic(detail.salaryMin !== null || detail.salaryMax !== null);
            setDeadline(detail.deadline ? detail.deadline.split('T')[0] : '');
            
            setLoading(false);
          })
          .catch((err) => {
            setError(err?.message ?? 'Failed to load job details.');
            setLoading(false);
          });
      }
    }
  }, [open, defaultPostedBy, editingJob]);

  const locationString =
    locationType === 'remote'
      ? 'Remote'
      : locationType === 'hybrid'
        ? location.trim()
          ? `${location.trim()} - Hybrid`
          : 'Hybrid'
        : location.trim() || 'On-site';

  const salaryMinNum = salaryMin !== '' ? parseFloat(salaryMin) : undefined;
  const salaryMaxNum = salaryMax !== '' ? parseFloat(salaryMax) : undefined;
  const salaryRangeValid =
    salaryMinNum === undefined || salaryMaxNum === undefined || salaryMinNum <= salaryMaxNum;

  const step1Valid =
    title.trim().length > 2 &&
    (locationType === 'remote' || location.trim().length > 0);
  const step2Valid = description.trim().length > 0 && salaryRangeValid;
  const canCreate = step1Valid && step2Valid;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    setError('');

    const fullDescription = requirements.trim()
      ? `${description.trim()}\n\nRequirements:\n${requirements.trim()}`
      : description.trim();

    try {
      if (editingJob) {
        const res = await recruiterApi.updateJob(editingJob.id, {
          title: title.trim(),
          description: fullDescription,
          location: locationString,
          employmentType: EmploymentTypeMap[employmentType] ?? 0,
          status: editingJob.status === 'Active' ? 1 : 2,
          requiredSkills: skills.trim() || undefined,
          salaryMin: salaryPublic ? salaryMinNum : undefined,
          salaryMax: salaryPublic ? salaryMaxNum : undefined,
          salaryCurrency: salaryCurrency.trim() || 'USD',
          postedBy: postedBy.trim() || undefined,
          departmentId: departmentId || undefined,
          deadline: deadline || undefined,
        });
        onUpdated?.(toRecruiterJob(res.data));
      } else {
        const res = await recruiterApi.createJob({
          title: title.trim(),
          description: fullDescription,
          location: locationString,
          employmentType: EmploymentTypeMap[employmentType] ?? 0,
          status: 1,
          requiredSkills: skills.trim() || undefined,
          salaryMin: salaryPublic ? salaryMinNum : undefined,
          salaryMax: salaryPublic ? salaryMaxNum : undefined,
          salaryCurrency: salaryCurrency.trim() || 'USD',
          postedBy: postedBy.trim() || undefined,
          departmentId: departmentId || undefined,
          deadline: deadline || undefined,
        });
        onCreated(toRecruiterJob(res.data));
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save job. Please try again.');
      setLoading(false);
    }
  };

  const locationTypes = [
    { value: 'onsite' as const, label: 'On-site' },
    { value: 'remote' as const, label: 'Remote' },
    { value: 'hybrid' as const, label: 'Hybrid' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 w-full bg-slate-900/45 backdrop-blur-sm"
            aria-label="Close"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'tween', duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-job-title"
            className="relative z-10 w-full max-w-2xl rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 id="create-job-title" className="font-display text-xl font-extrabold text-slate-900">
                  {editingJob ? 'Edit job opening' : 'Create a job'}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Step {step} of 2 &mdash; {step === 1 ? 'Basic details' : 'Description & requirements'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-slate-100">
              <motion.div
                className="h-full bg-brand-600"
                animate={{ width: step === 1 ? '50%' : '100%' }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Body */}
            <div className="max-h-[68vh] overflow-y-auto px-6 py-6">

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">

                  {/* 1. Job Title */}
                  <Input
                    label="Job title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Product Designer"
                  />

                  {/* 2. Department Assignment */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Department
                    </label>
                    <Select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                    >
                      <option value="">Select a department...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* 3. Posted By (Locked Organization) */}
                  <Input
                    label="Posted by"
                    value={postedBy}
                    disabled
                    onChange={(e) => setPostedBy(e.target.value)}
                  />

                  {/* 4. Employment Type */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Employment type
                    </label>
                    <Select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                    >
                      <option value="FullTime">Full-time</option>
                      <option value="PartTime">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </Select>
                  </div>

                  {/* 5. Location */}
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Location</span>
                    <div className="mt-2 flex rounded-xl border border-slate-200 p-1">
                      {locationTypes.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setLocationType(t.value)}
                          className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition ${
                            locationType === t.value
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {locationType !== 'remote' && (
                      <div className="mt-3">
                        <Input
                          placeholder={
                            locationType === 'hybrid'
                              ? 'e.g. London, UK (or remote/office distribution details)'
                              : 'e.g. London, UK'
                          }
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5">

                  {/* 1. Job Description */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Job description
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the role, day-to-day operations, and what they will do..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>

                  {/* 2. Key Requirements */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Key requirements
                      <span className="ml-1.5 font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="What qualifications, experience levels, or certifications are needed..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>

                  {/* 3. Skills Tagging */}
                  <Input
                    label="Required skills"
                    helperText="Comma separated, e.g. React, TypeScript, Figma"
                    placeholder="e.g. React, TypeScript, Node.js"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />

                  {/* 4. Salary */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Salary range</span>
                      <button
                        type="button"
                        onClick={() => setSalaryPublic(!salaryPublic)}
                        className={`text-xs font-semibold ${
                          salaryPublic ? 'text-brand-600 hover:text-brand-700' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {salaryPublic ? 'Publicly visible' : 'Hidden / Confidential'}
                      </button>
                    </div>
                    <div className="mt-2 flex gap-3">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        className="flex-1"
                      />
                      <Select
                        value={salaryCurrency}
                        onChange={(e) => setSalaryCurrency(e.target.value)}
                        className="w-24"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="LKR">LKR</option>
                        <option value="INR">INR</option>
                        <option value="AUD">AUD</option>
                        <option value="CAD">CAD</option>
                      </Select>
                    </div>
                    {!salaryRangeValid && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        Minimum cannot be greater than maximum.
                      </p>
                    )}
                  </div>

                  {/* 5. Application Deadline */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Application deadline
                      <span className="ml-1.5 font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-4">
              {error && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                {step === 1 ? (
                  <>
                    <Button fullWidth variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button fullWidth disabled={!step1Valid} onClick={() => setStep(2)}>
                      Next step
                    </Button>
                  </>
                ) : (
                  <>
                    <Button fullWidth variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button fullWidth disabled={!canCreate || loading} onClick={handleCreate}>
                      {loading ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin mr-1.5" />
                          Saving...
                        </>
                      ) : (
                        editingJob ? 'Save changes' : 'Create job'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
