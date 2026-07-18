import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckCircle2Icon, FileTextIcon, SparklesIcon } from 'lucide-react';
import type { Job } from '../data/jobs';
import { Button } from './ui/Button';
import { Textarea } from './ui/Input';
import { MatchScore } from './ui/MatchScore';
import { useAuth } from '../context/AuthContext';


interface ApplyJobShape {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  matchScore?: number;
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
  const { user, applyToJob } = useAuth();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const matchScore = (job as Job).matchScore ?? 75;

  const submit = async () => {
    setSubmitting(true);
    try {
      await applyToJob(job.id, {
        title: job.title,
        company: job.company,
        logo: job.companyLogo,
        coverLetter: note,
      });
      setDone(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setDone(false);
      setNote('');
    }, 200);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Apply to ${job.title}`}
            className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>

            {done ? (
              <div className="py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                >
                  <CheckCircle2Icon className="h-9 w-9" />
                </motion.div>
                <h2 className="mt-5 font-display text-xl font-bold text-slate-900">
                  Application submitted!
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Your application for <span className="font-semibold">{job.title}</span> at{' '}
                  {job.company} is in. Track its progress from your dashboard.
                </p>
                <Button fullWidth className="mt-6" onClick={close}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <h2 className="pr-8 font-display text-xl font-bold text-slate-900">
                  Apply to {job.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {job.company} · {job.location}
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                  <MatchScore score={matchScore} size={48} />
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <SparklesIcon className="h-4 w-4 text-brand-500" /> Strong match
                    </p>
                    <p className="text-xs text-slate-600">
                      Your profile aligns well with this role's requirements.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 p-3.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileTextIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user?.resumeName || 'No resume uploaded'}
                    </p>
                    <p className="text-xs text-slate-500">Attached from your profile</p>
                  </div>
                </div>

                <div className="mt-5">
                  <Textarea
                    label="Add a note (optional)"
                    placeholder="Share why you're a great fit for this role…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" fullWidth onClick={close}>
                    Cancel
                  </Button>
                  <Button fullWidth onClick={submit} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit application'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
