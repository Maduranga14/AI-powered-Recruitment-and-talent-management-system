import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  ClipboardCheckIcon,
  MessageSquareTextIcon,
  StarIcon } from
'lucide-react';
import type {
  ManagerCandidate,
  ManagerRecommendation } from
'../../data/hiringManager';
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
}

const dimensions = [
  'Technical skills',
  'Communication',
  'Culture fit'
];

export function HiringManagerFeedback({
  candidates,
  initialCandidateId,
  onSubmitFeedback
}: HiringManagerFeedbackProps) {
  const pending = candidates.filter(
    (candidate) => candidate.decisionStatus === 'Awaiting feedback'
  );
  const fallbackId = pending[0]?.id ?? candidates[0]?.id ?? '';
  const [candidateId, setCandidateId] = useState(
    initialCandidateId ?? fallbackId
  );
  const [recommendation, setRecommendation] =
    useState<ManagerRecommendation | null>(null);

  // Refined written comments
  const [strengths, setStrengths] = useState('');
  const [concerns, setConcerns] = useState('');
  const [generalImpression, setGeneralImpression] = useState('');

  // Overall rating
  const [overallRating, setOverallRating] = useState(0);

  const [scores, setScores] = useState<Record<string, number>>({
    'Technical skills': 0,
    'Communication': 0,
    'Culture fit': 0
  });
  const [submitted, setSubmitted] = useState(false);

  const candidate = useMemo(
    () => candidates.find((item) => item.id === candidateId),
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
    setScores({
      'Technical skills': 0,
      'Communication': 0,
      'Culture fit': 0
    });
    setSubmitted(false);
  }, [candidateId]);

  const canSubmit = Boolean(
    candidate &&
    recommendation &&
    overallRating > 0 &&
    generalImpression.trim().length >= 10
  );

  const submit = () => {
    if (!candidate || !recommendation || !canSubmit) return;
    const combinedEvidence = `Strengths:\n${strengths.trim() || 'None specified'}\n\nConcerns:\n${concerns.trim() || 'None specified'}\n\nGeneral Impression:\n${generalImpression.trim()}`;
    onSubmitFeedback(candidate.id, recommendation, combinedEvidence, overallRating, JSON.stringify(scores));
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1120px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Structured decision record
          </p>
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
          <h2 className="mt-5 font-display text-2xl font-extrabold">
            Feedback shared
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Your {recommendation?.toLowerCase()} recommendation for{' '}
            <strong>{candidate.name}</strong> is now ready for the team
            decision.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              const next = candidates.find(
                (item) => item.decisionStatus === 'Awaiting feedback'
              );
              setCandidateId(next?.id ?? candidate.id);
            }}
          >
            {pending.length ? 'Give next feedback' : 'Review submission'}
          </Button>
        </motion.section>
      ) : candidate ? (
        <div className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.35fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <label
                htmlFor="feedback-candidate"
                className="text-sm font-bold text-slate-800"
              >
                Candidate
              </label>
              <select
                id="feedback-candidate"
                value={candidateId}
                onChange={(event) => setCandidateId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {candidates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.role}
                  </option>
                ))}
              </select>
              <div className="mt-5 flex items-center gap-3">
                <img
                  src={candidate.avatar}
                  alt=""
                  className="h-12 w-12 rounded-xl"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {candidate.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {candidate.role}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {candidate.summary}
              </p>
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Interview focus
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {candidate.interviewFocus}
                </p>
              </div>
            </section>
            <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 shadow-soft">
              <MessageSquareTextIcon className="h-5 w-5 text-brand-600" />
              <h2 className="mt-3 font-display text-base font-bold">
                Write for the team
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ground your recommendation in concrete examples from the
                interview. Your notes will guide calibration and the next step.
              </p>
            </section>
          </aside>

          <section
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
            aria-labelledby="scorecard-title"
          >
            <h2 id="scorecard-title" className="font-display text-lg font-bold">
              Scorecard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Rate each area based on direct interview evidence.
            </p>

            {/* 1. Overall Rating */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-sm font-bold text-slate-800">Overall rating</span>
              <div className="mt-2.5 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    className="text-slate-300 hover:text-amber-400 transition"
                  >
                    <StarIcon
                      className={`h-7 w-7 ${
                        overallRating >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
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

            {/* 2. Recommendation */}
            <fieldset className="mt-6 border-t border-slate-100 pt-5">
              <legend className="text-sm font-bold text-slate-800">Recommendation decision</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {(['Strong Yes', 'Yes', 'Maybe', 'No', 'Strong No'] as ManagerRecommendation[]).map(
                  (option) => {
                    const isSelected = recommendation === option;
                    let activeStyles = 'border-slate-200 text-slate-600 hover:bg-slate-50';
                    if (isSelected) {
                      if (option === 'Strong Yes' || option === 'Yes') {
                        activeStyles = 'border-emerald-500 bg-emerald-50 text-emerald-700';
                      } else if (option === 'Maybe') {
                        activeStyles = 'border-amber-500 bg-amber-50 text-amber-700';
                      } else {
                        activeStyles = 'border-red-500 bg-red-50 text-red-700';
                      }
                    }
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRecommendation(option)}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${activeStyles}`}
                      >
                        {option}
                      </button>
                    );
                  }
                )}
              </div>
            </fieldset>

            {/* 3. Written comments */}
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
              <div className="relative">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">General Impression (Required)</label>
                <textarea
                  rows={3}
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

            {/* 4. Skill ratings */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-800">Skill-specific scorecard (Optional)</h3>
              <div className="mt-3 divide-y divide-slate-100">
                {dimensions.map((dimension) => (
                  <fieldset
                    key={dimension}
                    className="flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <legend className="text-xs font-semibold text-slate-600">{dimension}</legend>
                    <div className="flex gap-1.5" aria-label={`${dimension} rating`}>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() =>
                            setScores((current) => ({
                              ...current,
                              [dimension]: score,
                            }))
                          }
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                            scores[dimension] === score
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-200 text-slate-500 hover:border-brand-300 hover:bg-brand-50'
                          }`}
                          aria-pressed={scores[dimension] === score}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            </div>

            {/* Submit section */}
            <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <StarIcon className="h-4 w-4 text-amber-500" /> Overall rating and general impression are required.
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
          <h2 className="mt-3 font-semibold text-slate-900">
            No feedback assignments yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            New interviews needing your input will appear here.
          </p>
        </section>
      )}
    </motion.div>
  );
}