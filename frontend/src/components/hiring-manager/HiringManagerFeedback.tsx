import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  ExternalLinkIcon,
  GraduationCapIcon,
  MailIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  StarIcon,
  UserCheckIcon,
  UserXIcon,
} from 'lucide-react';
import type {
  ManagerCandidate,
  ManagerRecommendation,
} from '../../data/hiringManager';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';

interface HiringManagerFeedbackProps {
  candidates: ManagerCandidate[];
  initialCandidateId: string | null;
  onSubmitFeedback: (
    candidateId: string,
    recommendation: ManagerRecommendation,
    evidence: string,
    overallRating: number,
    skillRatingsJson: string
  ) => void;
  onMakeDecision?: (
    candidateId: string,
    decision: 'Hired' | 'Rejected' | 'UnderFinalReview',
    notes?: string
  ) => void;
}

function formatDateRange(start: string, end: string | null, isCurrent?: boolean): string {
  const s = new Date(start);
  const startStr = s.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  if (isCurrent) return `${startStr} – Present`;
  if (!end) return startStr;
  const e = new Date(end);
  return `${startStr} – ${e.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
}

export function HiringManagerFeedback({
  candidates,
  initialCandidateId,
  onSubmitFeedback,
  onMakeDecision,
}: HiringManagerFeedbackProps) {
  const pending = candidates.filter(
    (c) => c.decisionStatus === 'Awaiting feedback'
  );
  const fallbackId = pending[0]?.id ?? candidates[0]?.id ?? '';
  const [candidateId, setCandidateId] = useState(initialCandidateId ?? fallbackId);
  const [recommendation, setRecommendation] = useState<ManagerRecommendation | null>(null);
  const [strengths, setStrengths] = useState('');
  const [concerns, setConcerns] = useState('');
  const [generalImpression, setGeneralImpression] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const candidate = useMemo(
    () => candidates.find((c) => c.id === candidateId),
    [candidates, candidateId]
  );

  useEffect(() => {
    if (initialCandidateId) setCandidateId(initialCandidateId);
  }, [initialCandidateId]);

  useEffect(() => {
    setRecommendation(null);
    setStrengths('');
    setConcerns('');
    setGeneralImpression('');
    setOverallRating(0);
    setSubmitted(false);
  }, [candidateId]);

  const canSubmit = Boolean(
    candidate && recommendation && overallRating > 0 && generalImpression.trim().length >= 10
  );

  const submit = async () => {
    if (!candidate || !recommendation || !canSubmit) return;
    const combined = `Strengths:\n${strengths.trim() || 'None specified'}\n\nConcerns:\n${concerns.trim() || 'None specified'}\n\nGeneral Impression:\n${generalImpression.trim()}`;
    onSubmitFeedback(candidate.id, recommendation, combined, overallRating, undefined);
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1200px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Structured decision record</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Interview feedback
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Capture observable evidence while the conversation is fresh.
          </p>
        </div>
        <Badge tone="accent">
          <ClipboardCheckIcon className="h-3.5 w-3.5" /> Evidence required
        </Badge>
      </div>

      {/* Candidate selector bar */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <label htmlFor="feedback-candidate" className="text-sm font-bold text-slate-700">
          Reviewing candidate
        </label>
        <select
          id="feedback-candidate"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.role}
            </option>
          ))}
        </select>
      </div>

      {/* Success state */}
      {submitted && candidate ? (
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-7 rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-soft"
          aria-live="polite"
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2Icon className="h-9 w-9" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-extrabold">Feedback shared</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Your {recommendation?.toLowerCase()} recommendation for{' '}
            <strong>{candidate.name}</strong> is now ready for the team decision.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              const next = candidates.find((c) => c.decisionStatus === 'Awaiting feedback');
              setCandidateId(next?.id ?? candidate.id);
            }}
          >
            {pending.length ? 'Give next feedback' : 'Review submission'}
          </Button>
        </motion.section>

      ) : candidate ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.45fr]">

          {/* ══ LEFT: Full Candidate Profile ══ */}
          <aside className="space-y-4">

            {/* Identity */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <img
                  src={candidate.avatar}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-extrabold leading-tight text-slate-900">
                    {candidate.name}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-slate-600">{candidate.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge
                      tone={
                        candidate.decisionStatus === 'Awaiting feedback'
                          ? 'amber'
                          : candidate.decisionStatus === 'Feedback submitted'
                          ? 'brand'
                          : 'green'
                      }
                    >
                      {candidate.decisionStatus}
                    </Badge>
                    {candidate.departmentName && (
                      <Badge tone="slate">{candidate.departmentName}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
                {candidate.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.email && (
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    <a
                      href={`mailto:${candidate.email}`}
                      className="truncate text-brand-600 hover:underline"
                    >
                      {candidate.email}
                    </a>
                  </div>
                )}
                {candidate.appliedAt && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      Applied{' '}
                      {new Date(candidate.appliedAt).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <BriefcaseIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="font-semibold text-slate-700">{candidate.role}</span>
                </div>
              </div>

              {/* Resume */}
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  View Resume
                </a>
              )}
            </section>

            {/* Skills */}
            {candidate.skills.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <h3 className="mb-3 text-sm font-bold text-slate-800">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} tone="brand">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience timeline */}
            {candidate.experiences.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                  Work Experience
                </h3>
                <ol className="relative border-l-2 border-slate-100 pl-4">
                  {candidate.experiences.map((exp, i) => (
                    <li key={i} className="mb-5 last:mb-0">
                      <div className="absolute -left-[7px] h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-500" />
                      <p className="text-sm font-bold leading-tight text-slate-900">
                        {exp.title}
                        {exp.isCurrent && (
                          <span className="ml-2 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 align-middle">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                        <BuildingIcon className="h-3.5 w-3.5 shrink-0" />
                        {exp.company}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                      </p>
                      {exp.description && (
                        <p className="mt-1.5 text-xs leading-5 text-slate-500">
                          {exp.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Education */}
            {candidate.educations.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <GraduationCapIcon className="h-4 w-4 text-slate-400" />
                  Education
                </h3>
                <div className="space-y-4">
                  {candidate.educations.map((edu, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <GraduationCapIcon className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight text-slate-800">
                          {edu.degree} · {edu.fieldOfStudy}
                        </p>
                        <p className="text-xs font-medium text-slate-500">{edu.institution}</p>
                        <p className="text-xs text-slate-400">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cover letter */}
            {candidate.coverLetter && (
              <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquareTextIcon className="h-4 w-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-slate-800">Cover Letter</h3>
                </div>
                <p className="text-sm leading-6 text-slate-600 whitespace-pre-wrap line-clamp-6">
                  {candidate.coverLetter}
                </p>
              </section>
            )}

            {/* Interview focus hint */}
            <section className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Suggested interview focus
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{candidate.interviewFocus}</p>
            </section>
          </aside>

          {/* ══ RIGHT: Scorecard ══ */}
          <section
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6 self-start"
            aria-labelledby="scorecard-title"
          >
            <h2 id="scorecard-title" className="font-display text-lg font-bold">
              Scorecard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Rate this candidate based on direct interview evidence.
            </p>

            {/* Overall rating */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-sm font-bold text-slate-800">Overall rating</span>
              <div className="mt-2.5 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    className="transition text-slate-300 hover:text-amber-400"
                  >
                    <StarIcon
                      className={`h-7 w-7 ${
                        overallRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                {overallRating > 0 && (
                  <span className="ml-2 text-sm font-bold text-slate-700">
                    {overallRating} / 5
                  </span>
                )}
              </div>
            </div>

            {/* Recommendation */}
            <fieldset className="mt-6 border-t border-slate-100 pt-5">
              <legend className="text-sm font-bold text-slate-800">Recommendation decision</legend>
              <div className="mt-3 grid gap-2 grid-cols-5">
                {(['Strong Yes', 'Yes', 'Maybe', 'No', 'Strong No'] as ManagerRecommendation[]).map(
                  (option) => {
                    const isSelected = recommendation === option;
                    let cls = 'border-slate-200 text-slate-600 hover:bg-slate-50';
                    if (isSelected) {
                      cls =
                        option === 'Strong Yes' || option === 'Yes'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : option === 'Maybe'
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-red-500 bg-red-50 text-red-700';
                    }
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRecommendation(option)}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${cls}`}
                      >
                        {option}
                      </button>
                    );
                  }
                )}
              </div>
            </fieldset>

            {/* Written evaluation */}
            <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Written evaluation</h3>
              <Textarea
                label="Strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What did they excel at? Technical competence, experience highlights..."
              />
              <Textarea
                label="Concerns"
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="Any gaps or issues? Areas for growth, concerns about performance..."
              />
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  General Impression <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={generalImpression}
                  onChange={(e) => setGeneralImpression(e.target.value)}
                  placeholder="Summarize your final view and impressions of this candidate..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <p className="mt-1 text-right text-[10px] text-slate-400">
                  {generalImpression.trim().length} / 10 min characters
                </p>
              </div>

            </div>

            {/* Submit */}
            <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <StarIcon className="h-4 w-4 text-amber-500" />
                Overall rating and general impression are required.
              </p>
              <Button disabled={!canSubmit} onClick={submit}>
                <CheckCircle2Icon className="h-4 w-4" /> Submit feedback
              </Button>
            </div>
          </section>
        </div>

      ) : (
        <section className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <ClipboardCheckIcon className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 font-semibold text-slate-900">No feedback assignments yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            New interviews needing your input will appear here.
          </p>
        </section>
      )}
    </motion.div>
  );
}