import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuitIcon,
  CalendarIcon,
  CalendarPlusIcon,
  CheckCircle2Icon,
  CheckIcon,
  FileTextIcon,
  HistoryIcon,
  Loader2Icon,
  MailIcon,
  MapPinIcon,
  SendHorizonalIcon,
  SparklesIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';
import type { RecruiterCandidate, RecruiterStage } from '../../data/recruiter';
import { STAGE_TONES } from '../../data/recruiter';
import { recruiterCommunicationApi, type CommunicationLogDto } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScore } from '../ui/MatchScore';

interface CandidateDrawerProps {
  candidate: RecruiterCandidate | null;
  onClose: () => void;
  onStageChange: (candidateId: string, stage: RecruiterStage) => void;
  onSchedule: (candidate: RecruiterCandidate) => void;
}

export function CandidateDrawer({
  candidate,
  onClose,
  onStageChange,
  onSchedule,
}: CandidateDrawerProps) {
  const [noteSaved, setNoteSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  // Email Modal State
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Communication History State
  const [historyLogs, setHistoryLogs] = useState<CommunicationLogDto[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (candidate?.applicationId) {
      setLoadingHistory(true);
      recruiterCommunicationApi
        .getCommunicationHistory(candidate.applicationId)
        .then((logs) => setHistoryLogs(logs))
        .catch(() => setHistoryLogs([]))
        .finally(() => setLoadingHistory(false));
    } else {
      setHistoryLogs([]);
    }
  }, [candidate?.applicationId]);

  const saveNote = () => {
    setNoteSaved(true);
    window.setTimeout(() => setNoteSaved(false), 1800);
  };

  const openEmailModal = () => {
    if (candidate) {
      setEmailSubject(`Application Update — ${candidate.role} Position`);
      setEmailBody(
        `Dear ${candidate.name},\n\nWe wanted to share an update regarding your application for the ${candidate.role} position at our company.\n\nBest regards,\nRecruitment Team`
      );
      setEmailSuccessMsg(null);
      setEmailErrorMsg(null);
      setShowSendEmailModal(true);
    }
  };

  const handleDraftWithAi = () => {
    if (!candidate) return;
    setAiGenerating(true);
    setTimeout(() => {
      setEmailSubject(`Next Steps — ${candidate.role} Interview Schedule`);
      setEmailBody(
        `Dear ${candidate.name},\n\nThank you for your interest in the ${candidate.role} role at TalentPortal.\n\nBased on your background and skills (${candidate.skills.slice(0, 3).join(', ')}), we would love to move forward and invite you for a 30-minute interview discussion.\n\nPlease reply with your preferred availability for this week.\n\nWarm regards,\nTalent Acquisition Team`
      );
      setAiGenerating(false);
    }, 600);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate?.applicationId || !emailSubject.trim() || !emailBody.trim()) return;

    setSendingEmail(true);
    setEmailErrorMsg(null);
    setEmailSuccessMsg(null);

    try {
      const res = await recruiterCommunicationApi.sendApplicantEmail(candidate.applicationId, {
        subject: emailSubject,
        body: emailBody,
        messageType: 'ManualEmail',
      });
      setEmailSuccessMsg('Email sent successfully to candidate!');
      if (res?.data) {
        setHistoryLogs((prev) => [res.data, ...prev]);
      }
      setTimeout(() => {
        setShowSendEmailModal(false);
        setEmailSuccessMsg(null);
        setEmailSubject('');
        setEmailBody('');
      }, 1200);
    } catch (err) {
      setEmailErrorMsg(err instanceof Error ? err.message : 'Failed to send email.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <AnimatePresence>
      {candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close candidate modal"
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Centered Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${candidate.name} candidate profile`}
            className="relative z-10 my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img
                  src={candidate.avatar}
                  alt=""
                  className="h-10 w-10 rounded-xl"
                />
                <div>
                  <h2 className="font-display text-lg font-extrabold text-slate-900 leading-tight">
                    {candidate.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {candidate.role} &middot; {candidate.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Navigation Tabs */}
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      activeTab === 'details' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Candidate Details
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      activeTab === 'history' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <HistoryIcon className="h-3.5 w-3.5" />
                    History ({historyLogs.length})
                  </button>
                </div>

                <Badge tone={STAGE_TONES[candidate.stage]}>
                  {candidate.stage}
                </Badge>
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label="Close modal"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {activeTab === 'details' ? (
                <>
                  {/* Main Candidate Card & Quick Actions */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={candidate.avatar}
                          alt=""
                          className="h-16 w-16 rounded-2xl shadow-sm"
                        />
                        <div className="min-w-0">
                          <h3 className="font-display text-2xl font-extrabold text-slate-900">
                            {candidate.name}
                          </h3>
                          <p className="mt-0.5 text-sm font-semibold text-slate-600">
                            {candidate.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {candidate.location} &middot; Applied {candidate.applied}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        {candidate.stage === 'Interview' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-50 border border-blue-100 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-xs">
                            <CalendarIcon className="h-4 w-4" /> Interview Scheduled
                          </span>
                        ) : candidate.stage === 'Offer' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 border border-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs">
                            <CheckCircle2Icon className="h-4 w-4" /> Offer Extended
                          </span>
                        ) : candidate.stage === 'Rejected' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 shadow-xs">
                            <XCircleIcon className="h-4 w-4" /> Application Closed
                          </span>
                        ) : (
                          <MatchScore score={candidate.matchScore || (candidate.skills?.length ? Math.min(95, 72 + candidate.skills.length * 4) : 80)} size={60} />
                        )}
                      </div>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-200/60">
                      {candidate.stage === 'Under Final Review' ? (
                        <>
                          <Button
                            onClick={() => onStageChange(candidate.id, 'Offer')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            <CheckIcon className="h-4 w-4" /> Hire / Offer
                          </Button>
                          <Button
                            onClick={() => onStageChange(candidate.id, 'Rejected')}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                          >
                            <XIcon className="h-4 w-4" /> Reject
                          </Button>
                        </>
                      ) : candidate.stage === 'Offer' ? (
                        <Button
                          disabled
                          className="bg-emerald-600 text-white font-bold opacity-90 cursor-not-allowed col-span-2"
                        >
                          <CheckIcon className="h-4 w-4" /> Hired / Offer Extended
                        </Button>
                      ) : candidate.stage === 'Rejected' ? (
                        <Button
                          disabled
                          variant="outline"
                          className="border-red-200 text-red-600 bg-red-50 font-bold opacity-90 cursor-not-allowed col-span-2"
                        >
                          <XIcon className="h-4 w-4" /> Application Rejected
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => onStageChange(candidate.id, 'Shortlisted')}
                            disabled={candidate.stage !== 'New'}
                            variant={
                              candidate.stage !== 'New' ? 'secondary' : 'primary'
                            }
                          >
                            <CheckIcon className="h-4 w-4" />
                            {candidate.stage !== 'New' ? 'Shortlisted' : 'Shortlist'}
                          </Button>
                          <Button onClick={() => onSchedule(candidate)} variant="outline">
                            <CalendarPlusIcon className="h-4 w-4" /> Schedule
                          </Button>
                        </>
                      )}

                      <button
                        onClick={openEmailModal}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 text-xs font-bold shadow-sm transition"
                      >
                        <MailIcon className="h-4 w-4" /> Send Email
                      </button>

                      <Link
                        to={`/candidate-profile/${candidate.candidateProfileId || 'manager-candidate-1'}`}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 text-xs font-bold shadow-sm transition"
                      >
                        <BrainCircuitIcon className="h-4 w-4" /> Full Profile
                      </Link>
                    </div>
                  </div>

                  {/* Resume Document Link */}
                  {candidate.resumeUrl && (
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                          <FileTextIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {candidate.name}’s Resume
                          </p>
                          <p className="text-xs text-slate-500">PDF / Document File</p>
                        </div>
                      </div>
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        View Resume
                      </a>
                    </div>
                  )}

                  {/* Profile Snapshot & AI Rationale */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                        Profile Snapshot
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {candidate.summary}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-600">
                        {candidate.experience}
                      </p>
                    </section>

                    <section className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 shadow-xs">
                      <div className="flex items-center gap-2 text-brand-700">
                        <BrainCircuitIcon className="h-4 w-4" />
                        <h4 className="font-display text-xs font-bold uppercase tracking-wider">
                          AI Assessment Rationale
                        </h4>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {candidate.rationale}
                      </p>
                    </section>
                  </div>

                  {/* Post-Interview Evaluation Block */}
                  {(candidate.interviewRecommendation || candidate.interviewComments || candidate.interviewTechnicalScore) && (
                    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-soft">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                            ✓
                          </span>
                          <h4 className="font-display text-sm font-extrabold text-slate-900">
                            Post-Interview Evaluation
                          </h4>
                        </div>
                        {candidate.interviewOverallRating && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>
                                <svg
                                  className={`h-4 w-4 ${
                                    (candidate.interviewOverallRating || 0) >= star
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3.5 space-y-3">
                        {candidate.interviewRecommendation && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Interview Recommendation
                            </span>
                            <div className="mt-1">
                              <span
                                className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                                  candidate.interviewRecommendation === 'Strong Yes' ||
                                  candidate.interviewRecommendation === 'Yes'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : candidate.interviewRecommendation === 'Maybe'
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
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Interviewer Evaluation &amp; Comments
                            </span>
                            <p className="mt-1 text-sm leading-relaxed text-slate-800 whitespace-pre-line bg-white rounded-xl p-3.5 border border-emerald-100 shadow-xs font-medium">
                              {candidate.interviewComments}
                            </p>
                          </div>
                        )}

                        {candidate.interviewTechnicalScore && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Technical Assessment Score
                            </span>
                            <p className="mt-1 text-sm font-extrabold text-slate-800 bg-white rounded-xl p-2.5 border border-emerald-100 inline-block px-4">
                              {candidate.interviewTechnicalScore} / 5
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Pre-Interview Hiring Manager Review Block */}
                  {(candidate.evidence || candidate.recommendation || candidate.overallRating || candidate.feedback) && (
                    <section className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-white font-bold text-xs">
                            HM
                          </span>
                          Hiring Manager Pre-Interview Review
                        </h4>
                        {candidate.overallRating && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>
                                <svg
                                  className={`h-4 w-4 ${
                                    (candidate.overallRating || 0) >= star
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3.5 space-y-3">
                        {candidate.recommendation && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Recommendation
                            </span>
                            <div className="mt-1">
                              <span
                                className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                                  candidate.recommendation === 'Proceed to interview' ||
                                  candidate.recommendation === 'Strong Candidate'
                                    ? 'bg-brand-600 text-white'
                                    : candidate.recommendation === 'Reject'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {candidate.recommendation}
                              </span>
                            </div>
                          </div>
                        )}

                        {candidate.feedback && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Manager Comments
                            </span>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700 whitespace-pre-line bg-white rounded-xl p-3 border border-slate-100">
                              {candidate.feedback}
                            </p>
                          </div>
                        )}

                        {candidate.skillRatings && (() => {
                          try {
                            const parsed = JSON.parse(candidate.skillRatings);
                            const skills = Object.keys(parsed);
                            if (skills.length === 0) return null;
                            return (
                              <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                  Skill Ratings
                                </span>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  {skills.map((skill) => (
                                    <div
                                      key={skill}
                                      className="rounded-lg bg-white border border-slate-200 p-2.5 text-center"
                                    >
                                      <p className="text-[10px] font-semibold text-slate-500 truncate">
                                        {skill}
                                      </p>
                                      <p className="mt-1 text-base font-extrabold text-slate-800">
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

                  {/* Skills Tags */}
                  <section>
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                      Skills &amp; Competencies
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} tone="brand">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Recruiter Notes & Quick Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                          Recruiter Notes
                        </h4>
                        {noteSaved && (
                          <span className="text-xs font-semibold text-emerald-600">
                            Saved!
                          </span>
                        )}
                      </div>
                      <textarea
                        defaultValue={candidate.notes}
                        aria-label="Recruiter notes"
                        rows={3}
                        placeholder="Add internal notes about candidate fit..."
                        className="mt-2 w-full rounded-xl border border-slate-200 p-2.5 text-xs leading-relaxed text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={saveNote}
                      >
                        <FileTextIcon className="h-3.5 w-3.5" /> Save note
                      </Button>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
                      <div>
                        <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                          Candidate Contact
                        </h4>
                        <p className="mt-2 text-xs font-semibold text-slate-800 truncate">
                          {candidate.email}
                        </p>
                      </div>
                      <button
                        onClick={openEmailModal}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
                      >
                        <MailIcon className="h-3.5 w-3.5" />
                        Send Direct Email
                      </button>
                    </section>
                  </div>

                  {/* Update Pipeline Stage Bar */}
                  <section className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Update Candidate Stage
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {(
                        [
                          'Screening',
                          'Reviewed',
                          'Interview',
                          'Under Final Review',
                          'Offer',
                          'Rejected',
                        ] as RecruiterStage[]
                      ).map((stage) => (
                        <button
                          key={stage}
                          onClick={() => onStageChange(candidate.id, stage)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                            candidate.stage === stage
                              ? 'bg-slate-900 text-white shadow-sm'
                              : stage === 'Rejected'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                /* Communication History Tab */
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-display text-base font-extrabold text-slate-900">
                        Communication History
                      </h3>
                      <p className="text-xs text-slate-500">
                        All emails and updates sent to {candidate.name}
                      </p>
                    </div>
                    <Button size="sm" onClick={openEmailModal} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
                      <MailIcon className="h-3.5 w-3.5" /> Send New Email
                    </Button>
                  </div>

                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-12 text-slate-500">
                      <Loader2Icon className="h-6 w-6 animate-spin text-brand-600" />
                      <span className="ml-2 text-sm font-medium">Loading history logs...</span>
                    </div>
                  ) : historyLogs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                      <MailIcon className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm font-bold text-slate-700">No email history found</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Direct emails sent to this applicant will be logged here automatically.
                      </p>
                      <Button size="sm" variant="outline" onClick={openEmailModal} className="mt-4">
                        Send First Email
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historyLogs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                                {log.messageType || 'Direct Email'}
                              </span>
                              <h4 className="mt-1 text-sm font-bold text-slate-900">
                                {log.subject}
                              </h4>
                            </div>
                            <span className="text-[11px] font-medium text-slate-400 shrink-0">
                              {new Date(log.sentAt).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50 rounded-xl p-3 border border-slate-100">
                            {log.body}
                          </p>
                          <p className="mt-2 text-[11px] text-slate-400 font-medium">
                            Sent by: <span className="font-semibold text-slate-600">{log.senderName}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Application ID: {candidate.applicationId || 'N/A'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>

            {/* Direct Send Email Modal Overlay */}
            <AnimatePresence>
              {showSendEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowSendEmailModal(false)}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-display text-base font-extrabold text-slate-900">
                          Send Email to Candidate
                        </h3>
                        <p className="text-xs text-slate-500">
                          To: <span className="font-bold text-slate-700">{candidate.name}</span> ({candidate.email})
                        </p>
                      </div>
                      <button
                        onClick={() => setShowSendEmailModal(false)}
                        className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSendEmail} className="mt-4 space-y-4">
                      {emailSuccessMsg && (
                        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 border border-emerald-200 flex items-center gap-2">
                          <CheckCircle2Icon className="h-4 w-4 shrink-0" />
                          {emailSuccessMsg}
                        </div>
                      )}
                      {emailErrorMsg && (
                        <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
                          {emailErrorMsg}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">Subject</label>
                          <button
                            type="button"
                            onClick={handleDraftWithAi}
                            disabled={aiGenerating}
                            className="flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
                          >
                            <SparklesIcon className="h-3 w-3" />
                            {aiGenerating ? 'Generating draft...' : 'Draft with AI'}
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="e.g. Interview Schedule Update"
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                        <textarea
                          required
                          rows={6}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Write your message here..."
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowSendEmailModal(false)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={sendingEmail}
                          className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition disabled:opacity-50"
                        >
                          {sendingEmail ? (
                            <>
                              <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <SendHorizonalIcon className="h-3.5 w-3.5" /> Send Email
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}