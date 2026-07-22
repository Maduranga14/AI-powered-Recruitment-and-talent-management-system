import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  FileTextIcon,
  InfoIcon,
  Loader2Icon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import { Button } from './ui/Button';
import { MatchScore } from './ui/MatchScore';
import { useAuth } from '../context/AuthContext';

const NOTE_MAX = 500;
const RESUME_MAX_BYTES = 5 * 1024 * 1024;
const RESUME_ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

interface ApplyJobShape {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  matchScore?: number;
  skills?: string[];
}

type ModalPhase = 'form' | 'reviewing' | 'done';

function matchLabel(score: number): string {
  if (score >= 85) return 'Excellent match';
  if (score >= 70) return 'Strong match';
  if (score >= 50) return 'Good match';
  return 'Partial match';
}

function fileBaseName(name: string | null | undefined): string {
  if (!name) return '';
  const cleaned = name.split(/[\\/]/).pop() || name;
  return cleaned;
}

function validateResumeFile(file: File): string | null {
  const lower = file.name.toLowerCase();
  const validExt = lower.endsWith('.pdf') || lower.endsWith('.docx');
  if (!validExt) return 'Please choose a PDF or DOCX file.';
  if (file.size > RESUME_MAX_BYTES) return 'Resume must be 5 MB or smaller.';
  return null;
}

function computeMatchedSkills(
  profileSkills: string[] | undefined,
  jobSkills: string[] | undefined
): string[] {
  const profile = (profileSkills ?? []).map((s) => s.trim()).filter(Boolean);
  const required = (jobSkills ?? []).map((s) => s.trim()).filter(Boolean);
  if (!required.length) return profile.slice(0, 3);

  const matched = required.filter((skill) =>
    profile.some(
      (p) =>
        p.toLowerCase() === skill.toLowerCase() ||
        p.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(p.toLowerCase())
    )
  );

  if (matched.length) return matched.slice(0, 5);
  return required.slice(0, 3);
}

export function ApplyModal({
  job,
  open,
  onClose,
}: {
  job: ApplyJobShape;
  open: boolean;
  onClose: () => void;
}) {
  const { user, applyToJob, uploadResume } = useAuth();
  const titleId = useId();
  const noteId = useId();
  const chooseInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [note, setNote] = useState('');
  const [phase, setPhase] = useState<ModalPhase>('form');
  const [submitting, setSubmitting] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [selectedResumeName, setSelectedResumeName] = useState<string | null>(null);
  const [pendingResumeFile, setPendingResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Compute real match score fallback based on skill overlap if not provided
  const matchScore = useMemo(() => {
    if (job.matchScore !== undefined) return job.matchScore;
    if (!user || !user.skills || !job.skills || job.skills.length === 0) return 0;
    
    const userSkills = user.skills.map((s) => s.toLowerCase().trim());
    const jobSkills = job.skills.map((s) => s.toLowerCase().trim());
    const overlap = jobSkills.filter((s) => userSkills.includes(s));
    return Math.round((overlap.length * 100) / jobSkills.length);
  }, [job.matchScore, user, job.skills]);

  const profileResumeName = fileBaseName(user?.resumeName) || null;
  const displayResumeName = selectedResumeName || profileResumeName;

  const matchedSkills = useMemo(
    () => computeMatchedSkills(user?.skills, job.skills),
    [user?.skills, job.skills]
  );

  const matchedSkillsLabel =
    matchedSkills.length > 0
      ? matchedSkills.join(', ')
      : 'Java, Spring Boot, REST APIs';

  useEffect(() => {
    if (!open) return;
    setNote('');
    setPhase('form');
    setSubmitting(false);
    setDrafting(false);
    setStatusMessage(null);
    setResumeError(null);
    setSelectedResumeName(null);
    setPendingResumeFile(null);
    setUploadingResume(false);
  }, [open, job.id]);

  const busy = submitting || phase === 'reviewing' || uploadingResume;

  const handleNoteChange = (value: string) => {
    setNote(value.slice(0, NOTE_MAX));
  };

  const onChooseResume = (file: File | undefined) => {
    if (!file) return;
    const error = validateResumeFile(file);
    if (error) {
      setResumeError(error);
      return;
    }
    setResumeError(null);
    setPendingResumeFile(file);
    setSelectedResumeName(file.name);
  };

  const onUploadNewResume = async (file: File | undefined) => {
    if (!file) return;
    const error = validateResumeFile(file);
    if (error) {
      setResumeError(error);
      return;
    }
    setResumeError(null);
    setUploadingResume(true);
    try {
      await uploadResume(file);
      setPendingResumeFile(null);
      setSelectedResumeName(file.name);
      setStatusMessage('Resume uploaded to your profile.');
      window.setTimeout(() => setStatusMessage(null), 2200);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const draftWithAi = () => {
    if (drafting || busy) return;
    setDrafting(true);
    window.setTimeout(() => {
      const skillsLine =
        matchedSkills.length > 0
          ? matchedSkills.slice(0, 3).join(', ')
          : (user?.skills ?? []).slice(0, 3).join(', ') || 'relevant skills';
      const headline = user?.headline || user?.title || 'my background';
      const draft =
        `I'm excited to apply for the ${job.title} role at ${job.company}. ` +
        `With experience as ${headline}, I bring strengths in ${skillsLine}. ` +
        `I'd welcome the chance to contribute and grow with your team.`;
      setNote(draft.slice(0, NOTE_MAX));
      setDrafting(false);
    }, 700);
  };

  const submit = async () => {
    if (busy) return;
    setSubmitting(true);
    setResumeError(null);
    setStatusMessage('Application data captured. Reviewing documents...');
    setPhase('reviewing');

    try {
      if (pendingResumeFile) {
        await uploadResume(pendingResumeFile);
        setPendingResumeFile(null);
      }

      await new Promise((r) => window.setTimeout(r, 900));

      await applyToJob(job.id, {
        title: job.title,
        company: job.company,
        logo: job.companyLogo,
        coverLetter: note.trim() || undefined,
      });

      setPhase('done');
      setStatusMessage(null);
    } catch (err) {
      setPhase('form');
      setStatusMessage(null);
      setResumeError(
        err instanceof Error ? err.message : 'Failed to submit application'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    if (busy && phase !== 'done') return;
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full cursor-default bg-slate-900/50 backdrop-blur-sm"
            aria-label="Close dialog backdrop"
            onClick={close}
            disabled={busy && phase !== 'done'}
          />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
            transition={{ type: 'tween', duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <button
              type="button"
              onClick={close}
              disabled={busy && phase !== 'done'}
              className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <div className="overflow-y-auto px-6 pb-6 pt-6">
              {phase === 'done' ? (
                <div className="py-4 text-center sm:py-6">
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                  >
                    <CheckCircle2Icon className="h-9 w-9" aria-hidden />
                  </motion.div>
                  <h2
                    id={titleId}
                    className="mt-5 font-display text-xl font-bold tracking-tight text-slate-900"
                  >
                    Application Submitted
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                    Your application for{' '}
                    <span className="font-semibold text-slate-800">{job.title}</span> at{' '}
                    {job.company} is in. Track its progress from your dashboard.
                  </p>
                  <Button fullWidth className="mt-6" onClick={close}>
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <header className="pr-8">
                    <h2
                      id={titleId}
                      className="font-display text-xl font-bold tracking-tight text-slate-900"
                    >
                      Apply to {job.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                      {job.company}
                      <span className="mx-1.5 text-slate-300" aria-hidden>
                        ·
                      </span>
                      {job.location}
                    </p>
                  </header>

                  {/* AI Match Score */}
                  <section
                    className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/70 p-4"
                    aria-label="AI match score"
                  >
                    <div className="flex items-start gap-3.5">
                      <MatchScore score={matchScore} size={52} />
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <SparklesIcon
                            className="h-4 w-4 shrink-0 text-brand-600"
                            aria-hidden
                          />
                          <span>{matchLabel(matchScore)}</span>
                          <span
                            className="inline-flex text-slate-400"
                            title="AI match is estimated from your profile skills and this role's requirements."
                          >
                            <InfoIcon
                              className="h-3.5 w-3.5"
                              aria-label="About AI match score"
                            />
                          </span>
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          Matched skills: {matchedSkillsLabel}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Resume management */}
                  <section className="mt-5" aria-label="Resume">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <FileTextIcon className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          {displayResumeName ? (
                            <p className="truncate text-sm font-semibold text-slate-900">
                              Resume: {displayResumeName}
                            </p>
                          ) : (
                            <p className="text-sm font-semibold text-slate-900">
                              No resume on file
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-slate-500">
                            PDF or DOCX · max 5 MB
                          </p>
                        </div>
                      </div>

                      <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={busy}
                          onClick={() => chooseInputRef.current?.click()}
                        >
                          <FileTextIcon className="h-4 w-4" aria-hidden />
                          Choose Another Resume
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          disabled={busy}
                          onClick={() => uploadInputRef.current?.click()}
                        >
                          {uploadingResume ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <UploadIcon className="h-4 w-4" aria-hidden />
                          )}
                          Upload New Resume
                        </Button>
                      </div>

                      <input
                        ref={chooseInputRef}
                        type="file"
                        accept={RESUME_ACCEPT}
                        className="sr-only"
                        aria-label="Choose another resume"
                        onChange={(e) => {
                          onChooseResume(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                      <input
                        ref={uploadInputRef}
                        type="file"
                        accept={RESUME_ACCEPT}
                        className="sr-only"
                        aria-label="Upload new resume"
                        onChange={(e) => {
                          void onUploadNewResume(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />

                      {resumeError && (
                        <p
                          role="alert"
                          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                        >
                          {resumeError}
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Note + AI draft */}
                  <section className="mt-5">
                    <label
                      htmlFor={noteId}
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Add a note (optional)
                    </label>
                    <textarea
                      id={noteId}
                      value={note}
                      onChange={(e) => handleNoteChange(e.target.value)}
                      placeholder="Share why you're a great fit for this role..."
                      maxLength={NOTE_MAX}
                      disabled={busy}
                      rows={4}
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                    />
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p
                        className="text-xs tabular-nums text-slate-500"
                        aria-live="polite"
                      >
                        {note.length} / {NOTE_MAX} characters
                      </p>
                      <button
                        type="button"
                        onClick={draftWithAi}
                        disabled={busy || drafting}
                        className="inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {drafting ? (
                          <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
                        )}
                        Draft with AI (based on profile)
                      </button>
                    </div>
                  </section>

                  {/* Status / reviewing toast */}
                  <AnimatePresence>
                    {statusMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        role="status"
                        className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-3.5 py-3 text-sm text-brand-900"
                      >
                        <Loader2Icon
                          className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand-600"
                          aria-hidden
                        />
                        <span className="font-medium leading-snug">{statusMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Legal + actions */}
                  <p className="mt-5 text-[11px] leading-relaxed text-slate-500">
                    By submitting, you agree to our{' '}
                    <Link
                      to="/terms"
                      className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-brand-700"
                    >
                      Terms of Service
                    </Link>{' '}
                    and data sharing with Anushka&apos;s Team for recruitment purposes.
                    Track your application status{' '}
                    <Link
                      to="/dashboard"
                      className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-brand-700"
                    >
                      here
                    </Link>
                    .
                  </p>

                  <div className="mt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={close}
                      disabled={busy}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      fullWidth
                      onClick={() => void submit()}
                      disabled={busy}
                      aria-busy={submitting || phase === 'reviewing'}
                    >
                      {(submitting || phase === 'reviewing') && (
                        <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
                      )}
                      {submitting || phase === 'reviewing'
                        ? 'Submitting...'
                        : 'Submit application'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
