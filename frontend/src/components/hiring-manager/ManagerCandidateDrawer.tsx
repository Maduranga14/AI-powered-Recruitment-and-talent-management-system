import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuitIcon,
  BuildingIcon,
  CalendarClockIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  FileTextIcon,
  GraduationCapIcon,
  MapPinIcon,
  StarIcon,
  UserCheckIcon,
  UserXIcon,
  XCircleIcon,
  XIcon
} from 'lucide-react';
import type { ManagerCandidate } from '../../data/hiringManager';
import { DECISION_TONES } from '../../data/hiringManager';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScore } from '../ui/MatchScore';

interface ManagerCandidateDrawerProps {
  candidate: ManagerCandidate | null;
  onClose: () => void;
  onGiveFeedback: (candidateId: string) => void;
  onMakeDecision?: (
    candidateId: string,
    decision: 'Hired' | 'Rejected' | 'UnderFinalReview',
    notes?: string
  ) => void;
}

export function ManagerCandidateDrawer({
  candidate,
  onClose,
  onGiveFeedback,
  onMakeDecision
}: ManagerCandidateDrawerProps) {
  const [decisionModal, setDecisionModal] = useState<'Hired' | 'Rejected' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmDecision = async () => {
    if (!candidate || !decisionModal || !onMakeDecision) return;
    setIsSubmitting(true);
    try {
      await onMakeDecision(candidate.id, decisionModal, decisionNotes.trim() || undefined);
      setDecisionModal(null);
      setDecisionNotes('');
    } catch {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUnderFinalReview =
    candidate?.status === 'UnderFinalReview' ||
    candidate?.decisionStatus === 'Under Final Review';

  const hasFeedback = Boolean(
    candidate?.interviewComments ||
    candidate?.interviewOverallRating ||
    candidate?.interviewRecommendation ||
    candidate?.decisionStatus === 'Feedback submitted' ||
    candidate?.decisionStatus === 'Hired' ||
    candidate?.decisionStatus === 'Rejected'
  );

  return (
    <AnimatePresence>
      {candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close candidate modal"
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Centered Modal Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${candidate.name} profile`}
            className="relative z-10 my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-white shadow-2xl backdrop-blur-2xl max-h-[90vh]"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img
                  src={candidate.avatar}
                  alt=""
                  className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-700 bg-slate-950"
                />
                <div>
                  <h2 className="font-display text-lg font-extrabold text-white leading-tight">
                    {candidate.name}
                  </h2>
                  <p className="text-xs font-medium text-slate-400">
                    {candidate.role} &middot; {candidate.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge tone={DECISION_TONES[candidate.decisionStatus] || 'slate'} className="bg-brand-500/20 text-teal-300 border-brand-500/30">
                  {candidate.decisionStatus}
                </Badge>
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                  aria-label="Close modal"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 text-white">

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-white">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={candidate.avatar}
                      alt=""
                      className="h-16 w-16 rounded-2xl shadow-sm object-cover border border-slate-800 bg-slate-900"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl font-extrabold text-white">
                        {candidate.name}
                      </h3>
                      <p className="mt-0.5 text-sm font-semibold text-slate-300">
                        {candidate.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {candidate.location} &middot; Applied {candidate.applied}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {candidate.decisionStatus === 'Interview' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 px-3.5 py-2 text-xs font-bold text-blue-300 shadow-xs">
                        <CalendarIcon className="h-4 w-4" /> Interview Scheduled
                      </span>
                    ) : candidate.decisionStatus === 'Offer' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-300 shadow-xs">
                        <CheckCircle2Icon className="h-4 w-4" /> Offer Extended
                      </span>
                    ) : candidate.decisionStatus === 'Rejected' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-400 shadow-xs">
                        <XCircleIcon className="h-4 w-4" /> Application Closed
                      </span>
                    ) : (
                      <MatchScore score={candidate.matchScore || (candidate.skills?.length ? Math.min(95, 72 + candidate.skills.length * 4) : 80)} size={60} />
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-slate-800">
                  <Button
                    onClick={() => onGiveFeedback(candidate.id)}
                    disabled={hasFeedback}
                    variant={hasFeedback ? 'secondary' : 'primary'}
                    className={hasFeedback ? 'border-slate-700 bg-slate-800 text-slate-400 font-bold' : 'bg-brand-600 hover:bg-brand-500 text-white font-bold'}
                  >
                    <BrainCircuitIcon className="h-4 w-4" />
                    {hasFeedback ? 'Feedback Submitted' : 'Give feedback'}
                  </Button>
                  <Link
                    to={`/candidate-profile/${candidate.candidateProfileId ?? candidate.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition"
                  >
                    <BrainCircuitIcon className="h-4 w-4 text-teal-400" /> View Full Profile
                  </Link>
                </div>
              </div>

              {/* Hiring Manager Decision Management Card */}
              {onMakeDecision && (
                <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-white shadow-xs">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-teal-400">
                    Hiring Manager Decision
                  </h4>
                  {candidate.decisionStatus === 'Hired' || candidate.decisionStatus === 'Offer' ? (
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-950/60 px-4 py-3 text-emerald-200 border border-emerald-500/30">
                      <CheckCircle2Icon className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">Candidate Selected for Offer 🎉</p>
                        <p className="text-xs text-emerald-300">Final decision has been recorded as Offer Extended.</p>
                      </div>
                    </div>
                  ) : candidate.decisionStatus === 'Rejected' ? (
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-red-950/60 px-4 py-3 text-red-200 border border-red-500/30">
                      <UserXIcon className="h-5 w-5 text-red-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">Candidate Rejected</p>
                        <p className="text-xs text-red-300">Final decision has been recorded as Rejected.</p>
                      </div>
                    </div>
                  ) : isUnderFinalReview ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDecisionModal('Hired')}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold shadow-sm transition"
                      >
                        <UserCheckIcon className="h-4 w-4" /> Extend Offer
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionModal('Rejected')}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white py-2.5 text-xs font-bold shadow-sm transition"
                      >
                        <UserXIcon className="h-4 w-4" /> Reject Candidate
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-900 p-3.5 border border-slate-800 text-xs text-slate-300">
                      <BrainCircuitIcon className="h-4 w-4 text-teal-400 shrink-0" />
                      <span className="font-medium">Hiring decision buttons will appear once the applicant moves to Under Final Review stage.</span>
                    </div>
                  )}
                </section>
              )}

              {/* Profile Snapshot & Recommended Focus Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-white shadow-xs">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-teal-400">
                    Profile Snapshot
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {candidate.summary}
                  </p>
                  {candidate.experience && (
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      {candidate.experience}
                    </p>
                  )}
                </section>

                <section className="rounded-2xl border border-brand-500/30 bg-slate-950/70 p-4 text-white shadow-xs">
                  <div className="flex items-center gap-2 text-teal-300">
                    <BrainCircuitIcon className="h-4 w-4" />
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider">
                      Recommended Interview Focus
                    </h4>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {candidate.interviewFocus}
                  </p>
                </section>
              </div>

              {/* Hiring Manager Pre-Interview Review Block */}
              {(candidate.evidence || candidate.recommendation || candidate.overallRating) && (
                <section className="rounded-2xl border border-brand-500/30 bg-slate-950/70 p-5 text-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <BrainCircuitIcon className="h-4 w-4 text-teal-300" />
                      <h4 className="font-display text-sm font-extrabold text-white">
                        Hiring Manager Pre-Interview Review
                      </h4>
                    </div>
                    {candidate.recommendation && (
                      <Badge
                        tone={
                          candidate.recommendation === 'Advance' || candidate.recommendation === 'Strong Yes' || candidate.recommendation === 'Yes'
                            ? 'green'
                            : candidate.recommendation === 'Hold' || candidate.recommendation === 'Maybe'
                              ? 'amber'
                              : 'red'
                        }
                        className="bg-brand-500/20 text-teal-300 border-brand-500/30"
                      >
                        {candidate.recommendation}
                      </Badge>
                    )}
                  </div>

                  {candidate.evidence && (
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Manager Comments
                      </span>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-200 whitespace-pre-line bg-slate-900 rounded-xl p-3.5 border border-slate-800 font-medium">
                        {candidate.evidence}
                      </p>
                    </div>
                  )}

                  {candidate.overallRating && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Rating:</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${(candidate.overallRating || 0) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-white ml-1">
                        {candidate.overallRating} / 5
                      </span>
                    </div>
                  )}
                </section>
              )}

              {/* Post-Interview Evaluation Block */}
              {(candidate.interviewRecommendation || candidate.interviewComments || candidate.interviewTechnicalScore || candidate.interviewSkillRatings) && (
                <section className="rounded-2xl border border-emerald-500/30 bg-slate-950/70 p-5 text-white shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                        ✓
                      </span>
                      <h4 className="font-display text-sm font-extrabold text-white">
                        Post-Interview Evaluation
                      </h4>
                    </div>
                    {candidate.interviewOverallRating && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${(candidate.interviewOverallRating || 0) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {candidate.interviewRecommendation && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Interview Recommendation
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${candidate.interviewRecommendation === 'Strong Yes' ||
                              candidate.interviewRecommendation === 'Yes' ||
                              candidate.interviewRecommendation === 'Advance'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : candidate.interviewRecommendation === 'Maybe' ||
                                candidate.interviewRecommendation === 'Hold'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-red-600 text-white shadow-sm'
                              }`}
                          >
                            {candidate.interviewRecommendation}
                          </span>
                        </div>
                      </div>
                    )}

                    {candidate.interviewComments && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Interviewer Evaluation &amp; Comments
                        </span>
                        <p className="mt-1 text-sm leading-relaxed text-slate-200 whitespace-pre-line bg-slate-900 rounded-xl p-3.5 border border-slate-800 font-medium">
                          {candidate.interviewComments}
                        </p>
                      </div>
                    )}

                    {candidate.interviewTechnicalScore && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Technical Assessment Score
                        </span>
                        <p className="mt-1 text-sm font-extrabold text-white bg-slate-900 rounded-xl p-2.5 border border-slate-800 inline-block px-4">
                          {candidate.interviewTechnicalScore} / 5
                        </p>
                      </div>
                    )}

                    {candidate.interviewSkillRatings && (() => {
                      try {
                        const parsed = JSON.parse(candidate.interviewSkillRatings);
                        const skills = Object.keys(parsed);
                        if (skills.length === 0) return null;
                        return (
                          <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Skill Scorecard
                            </span>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {skills.map((skill) => (
                                <div
                                  key={skill}
                                  className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-center text-white"
                                >
                                  <p className="text-[10px] font-semibold text-slate-400 truncate">
                                    {skill}
                                  </p>
                                  <p className="mt-1 text-base font-extrabold text-white">
                                    {parsed[skill]} / 5
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                </section>
              )}

              {/* Key Signals */}
              {candidate.signals.length > 0 && (
                <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-white shadow-xs">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-teal-400">
                    Key Signals
                  </h4>
                  <ul className="mt-2.5 space-y-2">
                    {candidate.signals.map((signal) => (
                      <li key={signal} className="flex gap-2.5 text-sm text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Skills Badges */}
              {candidate.skills.length > 0 && (
                <section>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
                    Skills & Competencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} tone="brand" className="bg-brand-500/20 text-teal-300 border-brand-500/30">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Work Experiences */}
              {candidate.experiences && candidate.experiences.length > 0 && (
                <section>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">
                    Work Experience
                  </h4>
                  <div className="space-y-3">
                    {candidate.experiences.map((exp, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-white">
                        <p className="font-bold text-white">{exp.title}</p>
                        <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <BuildingIcon className="h-3 w-3 text-teal-400" /> {exp.company}
                        </p>
                        {exp.description && (
                          <p className="mt-1.5 text-slate-300 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education Entries */}
              {candidate.educations && candidate.educations.length > 0 && (
                <section>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
                    Education
                  </h4>
                  <div className="space-y-2">
                    {candidate.educations.map((edu, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-white">
                        <GraduationCapIcon className="h-4 w-4 text-teal-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">{edu.degree} &middot; {edu.fieldOfStudy}</p>
                          <p className="text-slate-400">{edu.institution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </motion.div>
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {decisionModal && candidate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDecisionModal(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl backdrop-blur-2xl"
          >
            <h3 className="font-display text-xl font-extrabold text-white">
              Confirm {decisionModal === 'Hired' ? 'Job Offer' : 'Rejection'} Decision
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Are you sure you want to mark <strong>{candidate.name}</strong> for an{' '}
              <span className={decisionModal === 'Hired' ? 'font-bold text-emerald-400' : 'font-bold text-red-400'}>
                {decisionModal === 'Hired' ? 'Offer Extended' : 'Rejected'}
              </span>
              ?
            </p>
            <div className="mt-4">
              <label className="block text-xs font-bold text-white mb-1">
                Decision Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Add notes about your hiring choice..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDecisionModal(null)} className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold">
                Cancel
              </Button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmDecision}
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition ${decisionModal === 'Hired'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-red-600 hover:bg-red-500'
                  }`}
              >
                {isSubmitting ? 'Saving...' : `Confirm ${decisionModal}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

