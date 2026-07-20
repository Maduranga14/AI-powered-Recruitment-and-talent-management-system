import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  CodeIcon,
  MessageSquareTextIcon,
  StarIcon,
  ThumbsUpIcon,
  XIcon,
} from 'lucide-react';
import type { InterviewDto } from '../../services/api';

export type InterviewRecommendation =
  | 'Strong Yes'
  | 'Yes'
  | 'Maybe'
  | 'No'
  | 'Strong No';

const SKILL_DIMENSIONS = ['Technical skills', 'Communication', 'Culture fit'] as const;

interface InterviewFeedbackModalProps {
  interview: InterviewDto | null;
  onClose: () => void;
  onSubmit: (
    interviewId: string,
    payload: {
      recommendation: string;
      comments: string;
      overallRating: number;
      skillRatings?: string;
      technicalAssessmentScore?: number | null;
    }
  ) => Promise<void>;
}

function StarPicker({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'h-9 w-9' : size === 'sm' ? 'h-5 w-5' : 'h-7 w-7';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            aria-label={`${star} star`}
          >
            <StarIcon
              className={`${sz} transition-colors ${
                active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-bold text-slate-600">{value} / 5</span>
      )}
    </div>
  );
}

function ScoreChip({
  score,
  selected,
  onClick,
}: {
  score: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        selected
          ? 'border-brand-600 bg-brand-600 text-white shadow-md scale-110'
          : 'border-slate-200 text-slate-500 hover:border-brand-300 hover:bg-brand-50'
      }`}
      aria-pressed={selected}
    >
      {score}
    </button>
  );
}

function RecommendationButton({
  option,
  selected,
  onClick,
}: {
  option: InterviewRecommendation;
  selected: boolean;
  onClick: () => void;
}) {
  let base = 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50';
  if (selected) {
    if (option === 'Strong Yes')
      base = 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200';
    else if (option === 'Yes')
      base = 'border-emerald-500 bg-emerald-50 text-emerald-700';
    else if (option === 'Maybe')
      base = 'border-amber-500 bg-amber-50 text-amber-700';
    else if (option === 'No')
      base = 'border-red-400 bg-red-50 text-red-700';
    else
      base = 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-200';
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border py-2.5 px-1 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${base}`}
    >
      {option}
    </button>
  );
}

export function InterviewFeedbackModal({
  interview,
  onClose,
  onSubmit,
}: InterviewFeedbackModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [recommendation, setRecommendation] =
    useState<InterviewRecommendation | null>(null);
  const [skillScores, setSkillScores] = useState<Record<string, number>>({
    'Technical skills': 0,
    Communication: 0,
    'Culture fit': 0,
  });
  const [technicalScore, setTechnicalScore] = useState<number>(0);
  const [showTechScore, setShowTechScore] = useState(false);
  const [strengths, setStrengths] = useState('');
  const [concerns, setConcerns] = useState('');
  const [generalImpression, setGeneralImpression] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset on interview change
  useEffect(() => {
    setOverallRating(0);
    setRecommendation(null);
    setSkillScores({ 'Technical skills': 0, Communication: 0, 'Culture fit': 0 });
    setTechnicalScore(0);
    setShowTechScore(false);
    setStrengths('');
    setConcerns('');
    setGeneralImpression('');
    setSubmitting(false);
    setError('');
  }, [interview?.id]);

  const canSubmit =
    overallRating > 0 &&
    recommendation !== null &&
    generalImpression.trim().length >= 10;

  const handleSubmit = async () => {
    if (!interview || !canSubmit || !recommendation) return;
    setSubmitting(true);
    setError('');
    try {
      const combinedComments = [
        strengths.trim() ? `Strengths:\n${strengths.trim()}` : '',
        concerns.trim() ? `Concerns:\n${concerns.trim()}` : '',
        `General Impression:\n${generalImpression.trim()}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      await onSubmit(interview.id, {
        recommendation,
        comments: combinedComments,
        overallRating,
        skillRatings: JSON.stringify(skillScores),
        technicalAssessmentScore: showTechScore && technicalScore > 0 ? technicalScore : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback.');
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {interview && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-x-4 bottom-0 top-4 z-50 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-6 sm:bottom-6 sm:w-full"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-brand-50 to-slate-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-200">
                  <ClipboardListIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Interview Feedback
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 font-medium">
                    {interview.candidateName} &middot; {interview.jobTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Overall Rating */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-amber-400" />
                  Overall Rating
                  <span className="text-red-500">*</span>
                </h3>
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <StarPicker value={overallRating} onChange={setOverallRating} size="lg" />
                </div>
              </section>

              {/* Recommendation */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ThumbsUpIcon className="h-4 w-4 text-brand-500" />
                  Recommendation
                  <span className="text-red-500">*</span>
                </h3>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {(
                    ['Strong Yes', 'Yes', 'Maybe', 'No', 'Strong No'] as InterviewRecommendation[]
                  ).map((opt) => (
                    <RecommendationButton
                      key={opt}
                      option={opt}
                      selected={recommendation === opt}
                      onClick={() => setRecommendation(opt)}
                    />
                  ))}
                </div>
              </section>

              {/* Skill Scorecard */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardListIcon className="h-4 w-4 text-brand-500" />
                  Skill Scorecard
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Optional
                  </span>
                </h3>
                <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/60 px-4">
                  {SKILL_DIMENSIONS.map((dim) => (
                    <fieldset
                      key={dim}
                      className="flex items-center justify-between py-3"
                    >
                      <legend className="text-sm font-semibold text-slate-700">
                        {dim}
                      </legend>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <ScoreChip
                            key={s}
                            score={s}
                            selected={skillScores[dim] === s}
                            onClick={() =>
                              setSkillScores((prev) => ({ ...prev, [dim]: s }))
                            }
                          />
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </section>

              {/* Technical Assessment Score (optional) */}
              <section>
                <label className="flex cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showTechScore}
                    onChange={(e) => setShowTechScore(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <CodeIcon className="h-4 w-4 text-brand-500" />
                    Include Technical Assessment Score
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Optional
                  </span>
                </label>
                {showTechScore && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <span className="text-xs font-semibold text-slate-500 w-32 shrink-0">
                      Technical score
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <ScoreChip
                          key={s}
                          score={s}
                          selected={technicalScore === s}
                          onClick={() => setTechnicalScore(s)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </section>

              {/* Written Comments */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquareTextIcon className="h-4 w-4 text-brand-500" />
                  Written Evaluation
                </h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Strengths
                      <span className="ml-1 font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="What did they excel at? Technical competence, communication, problem-solving..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Concerns
                      <span className="ml-1 font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={concerns}
                      onChange={(e) => setConcerns(e.target.value)}
                      placeholder="Any gaps, concerns, or areas to probe further..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      General Impression
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={generalImpression}
                      onChange={(e) => setGeneralImpression(e.target.value)}
                      placeholder="Summarize your overall impression — fit for the role, team, and culture..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <p className="mt-1 text-right text-[10px] text-slate-400">
                      {generalImpression.trim().length} / 10 min characters
                    </p>
                  </div>
                </div>
              </section>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                Overall rating, recommendation &amp; general impression required.
              </p>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSubmit || submitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting&hellip;
                    </>
                  ) : (
                    <>
                      <CheckCircle2Icon className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
