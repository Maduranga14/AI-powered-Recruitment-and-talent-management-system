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
        : 'Scheduling flow opened ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â choose a candidate and time.'
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
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [title, setTitle] = useState('');
  const [postedBy, setPostedBy] = useState(defaultPostedBy);
  const [employmentType, setEmploymentType] = useState('FullTime');
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState<'onsite' | 'remote' | 'hybrid'>('onsite');
  const [departmentId, setDepartmentId] = useState('');

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
    }
  }, [open, defaultPostedBy]);

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
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create job. Please try again.');
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
                  Create a job
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
                    autoFocus
                  />

                  {/* 2. Posted by */}
                  <Input
                    label="Posted by"
                    value={postedBy}
                    onChange={(e) => setPostedBy(e.target.value)}
                    placeholder="e.g. Northwind Labs"
                    hint="Company or organization posting this job"
                  />

                  <Select
                    label="Employment type"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                  >
                    <option value="FullTime">Full-time</option>
                    <option value="PartTime">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </Select>

                  {/* 4. Location Ã¢â‚¬â€ work arrangement toggle */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">Work arrangement</p>
                    <div className="flex gap-2">
                      {locationTypes.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setLocationType(value)}
                          className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                            locationType === value
                              ? 'border-brand-600 bg-brand-50 text-brand-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City input Ã¢â‚¬â€ hidden when Remote */}
                  {locationType !== 'remote' && (
                    <Input
                      label={locationType === 'hybrid' ? 'City / Office location' : 'Location'}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New York, NY"
                    />
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5">

                  {/* 6. Job Description */}
                  <div>
                    <Textarea
                      label="Job description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the role, responsibilities, and what success looks like..."
                      className="min-h-[140px]"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Cover the overview, day-to-day responsibilities, and team context.
                    </p>
                  </div>

                  {/* 7. Requirements / Qualifications */}
                  <div>
                    <Textarea
                      label="Requirements & qualifications"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder={'- 3+ years of experience in...\n- Proficiency in...\n- Degree in relevant field or equivalent experience'}
                      hint="One requirement per line. Start each with a dash for clarity."
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Required skills */}
                  <Input
                    label="Required skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Node.js"
                    hint="Comma-separated list of key skills"
                  />

                  {/* 5. Salary Range */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        Salary range
                        <span className="ml-1.5 font-normal text-slate-400">(optional)</span>
                      </p>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={salaryPublic}
                          onChange={(e) => setSalaryPublic(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        Display publicly
                      </label>
                    </div>
                    <div
                      className={`grid grid-cols-[1fr_1fr_auto] gap-2 transition-opacity ${
                        !salaryPublic ? 'pointer-events-none opacity-40' : ''
                      }`}
                    >
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
                        Minimum cannot be greater than maximum.
                      </p>
                    )}
                  </div>

                  {/* 8. Application Deadline */}
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
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create job'
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
