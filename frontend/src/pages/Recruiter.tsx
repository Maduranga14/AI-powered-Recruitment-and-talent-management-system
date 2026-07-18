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
import {
  RecruiterShell,
  type RecruiterView,
} from '../components/recruiter/RecruiterShell';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import {
  RECRUITER_CANDIDATES,
  RECRUITER_INTERVIEWS,
  RECRUITER_MESSAGES,
  type RecruiterCandidate,
  type RecruiterJob,
  type RecruiterStage,
} from '../data/recruiter';
import {
  recruiterApi,
  EmploymentTypeMap,
  type JobPostingListItem,
} from '../services/api';
import { useAuth } from '../context/AuthContext';


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
    applicants: 0,
    screened: 0,
    shortlisted: 0,
    interviews: 0,
    target: 1,
    posted,
  };
}

export function Recruiter() {
  const [view, setView] = useState<RecruiterView>('overview');
  const [candidates, setCandidates] = useState(RECRUITER_CANDIDATES);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] =
    useState<RecruiterCandidate | null>(null);
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

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2800);
  };

  const updateStage = (candidateId: string, stage: RecruiterStage) => {
    setCandidates((current) =>
      current.map((c) => (c.id === candidateId ? { ...c, stage } : c))
    );
    setSelectedCandidate((current) =>
      current?.id === candidateId ? { ...current, stage } : current
    );
    const candidate = candidates.find((item) => item.id === candidateId);
    showFeedback(`${candidate?.name ?? 'Candidate'} moved to ${stage}.`);
  };

  const openSchedule = (candidate?: RecruiterCandidate) => {
    setView('schedule');
    showFeedback(
      candidate
        ? `Scheduling flow opened for ${candidate.name}.`
        : 'Scheduling flow opened — choose a candidate and time.'
    );
  };

  const toggleJobStatus = (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    setJobs((current) =>
      current.map((item) =>
        item.id === jobId
          ? { ...item, status: item.status === 'Active' ? 'Paused' : 'Active' }
          : item
      )
    );
    showFeedback(
      `${job?.title ?? 'Job'} ${job?.status === 'Active' ? 'paused' : 'resumed'}.`
    );
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
      onViewChange={setView}
      onCreateJob={() => setCreateOpen(true)}
    >
      {view === 'overview' && (
        <RecruiterOverview
          candidates={candidates}
          jobs={jobs}
          interviews={RECRUITER_INTERVIEWS}
          onViewChange={setView}
          onCandidateSelect={(c) => setSelectedCandidate(c)}
        />
      )}
      {view === 'jobs' && (
        <RecruiterJobs
          jobs={jobs}
          loading={jobsLoading}
          onCreateJob={() => setCreateOpen(true)}
          onSchedule={() => openSchedule()}
          onStatusChange={toggleJobStatus}
          onViewApplicants={() => {
            setView('candidates');
            showFeedback('Showing candidates across your open roles.');
          }}
        />
      )}
      {view === 'candidates' && (
        <RecruiterCandidates
          candidates={candidates}
          onCandidateSelect={(c) => setSelectedCandidate(c)}
          onStageChange={updateStage}
        />
      )}
      {view === 'hiring-managers' && (
        <RecruiterHiringManagers />
      )}
      {view === 'departments' && (
        <RecruiterDepartments />
      )}
      {view === 'schedule' && (
        <RecruiterSchedule
          interviews={RECRUITER_INTERVIEWS}
          onSchedule={() => openSchedule()}
        />
      )}
      {view === 'inbox' && <RecruiterInbox messages={RECRUITER_MESSAGES} />}

      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onStageChange={updateStage}
        onSchedule={openSchedule}
      />

      <CreateJobModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleJobCreated}
        defaultPostedBy={user?.organizationName ?? ''}
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
  defaultPostedBy?: string;
}

function CreateJobModal({ open, onClose, onCreated, defaultPostedBy = '' }: CreateJobModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('FullTime');
  const [skills, setSkills] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [postedBy, setPostedBy] = useState(defaultPostedBy);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setLocation('');
      setEmploymentType('FullTime');
      setSkills('');
      setSalaryMin('');
      setSalaryMax('');
      setSalaryCurrency('USD');
      setPostedBy(defaultPostedBy);
      setDepartmentId('');
      setError('');
      setLoading(false);

      (async () => {
        try {
          const res = await recruiterApi.getDepartments();
          setDepartments(res.departments);
        } catch (e) {
          console.error('Failed to load departments in modal:', e);
        }
      })();
    }
  }, [open, defaultPostedBy]);

  const salaryMinNum = salaryMin !== '' ? parseFloat(salaryMin) : undefined;
  const salaryMaxNum = salaryMax !== '' ? parseFloat(salaryMax) : undefined;
  const salaryRangeValid =
    salaryMinNum === undefined ||
    salaryMaxNum === undefined ||
    salaryMinNum <= salaryMaxNum;

  const canCreate =
    title.trim().length > 2 &&
    description.trim().length > 0 &&
    location.trim().length > 0 &&
    salaryRangeValid;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    setError('');

    try {
      const res = await recruiterApi.createJob({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        employmentType: EmploymentTypeMap[employmentType] ?? 0,
        status: 1,
        requiredSkills: skills.trim() || undefined,
        salaryMin: salaryMinNum,
        salaryMax: salaryMaxNum,
        salaryCurrency: salaryCurrency.trim() || 'USD',
        postedBy: postedBy.trim() || undefined,
        departmentId: departmentId || undefined,
      });

      onCreated(toRecruiterJob(res.data));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create job. Please try again.');
      setLoading(false);
    }
  };

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
            aria-label="Close create job dialog"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'tween', duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-job-title"
            className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <h2
              id="create-job-title"
              className="font-display text-xl font-extrabold"
            >
              Create a job
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fill in the details and publish to go live instantly.
            </p>

            <div className="mt-6 space-y-4">
              <Input
                label="Job title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                autoFocus
              />
              <Input
                label="Posted by"
                value={postedBy}
                onChange={(e) => setPostedBy(e.target.value)}
                placeholder="e.g. Northwind Labs"
                hint="Company or organization posting this job"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote · US"
                />
                <Select
                  label="Type"
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
              <Select
                label="Department / Team (Optional)"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">No department (General)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and what success looks like…"
              />

              {/* Estimated salary */}
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">
                  Estimated salary{' '}
                  <span className="font-normal text-slate-400">(optional)</span>
                </p>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    min={0}
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    error={!salaryRangeValid ? 'Min > Max' : undefined}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    min={0}
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
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
                    Minimum salary cannot be greater than maximum.
                  </p>
                )}
              </div>

              <Input
                label="Required skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js"
                hint="Comma-separated"
              />
            </div>

            {error && (
              <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="mt-7 flex gap-3">
              <Button fullWidth variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                fullWidth
                disabled={!canCreate || loading}
                onClick={handleCreate}
              >
                {loading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create job'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
