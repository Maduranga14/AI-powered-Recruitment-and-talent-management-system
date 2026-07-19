import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuitIcon,
  CalendarPlusIcon,
  CheckIcon,
  FileTextIcon,
  MailIcon,
  MapPinIcon,
  XIcon } from
'lucide-react';
import type { RecruiterCandidate, RecruiterStage } from '../../data/recruiter';
import { STAGE_TONES } from '../../data/recruiter';
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
  onSchedule
}: CandidateDrawerProps) {
  const [noteSaved, setNoteSaved] = useState(false);
  const [emailQueued, setEmailQueued] = useState(false);
  const saveNote = () => {
    setNoteSaved(true);
    window.setTimeout(() => setNoteSaved(false), 1800);
  };
  const queueEmail = () => {
    setEmailQueued(true);
    window.setTimeout(() => setEmailQueued(false), 2200);
  };
  return (
    <AnimatePresence>
      {candidate &&
      <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          onClick={onClose}
          aria-label="Close candidate details"
          className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]" />
        
          <motion.aside
          initial={{
            x: '100%'
          }}
          animate={{
            x: 0
          }}
          exit={{
            x: '100%'
          }}
          transition={{
            type: 'tween',
            duration: 0.24
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${candidate.name} candidate profile`}
          className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
          
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-slate-700">
                Candidate profile
              </p>
              <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close candidate profile">
              
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <img
                src={candidate.avatar}
                alt=""
                className="h-16 w-16 rounded-2xl" />
              
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl font-extrabold text-slate-900">
                      {candidate.name}
                    </h2>
                    <Badge tone={STAGE_TONES[candidate.stage]}>
                      {candidate.stage}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {candidate.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPinIcon className="h-4 w-4" />
                    {candidate.location}
                  </p>
                </div>
                <MatchScore score={candidate.matchScore} size={58} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                onClick={() => onStageChange(candidate.id, 'Shortlisted')}
                variant={
                candidate.stage === 'Shortlisted' ? 'secondary' : 'primary'
                }>
                
                  <CheckIcon className="h-4 w-4" />
                  {candidate.stage === 'Shortlisted' ?
                'Shortlisted' :
                'Shortlist'}
                </Button>
                <Button onClick={() => onSchedule(candidate)} variant="outline">
                  <CalendarPlusIcon className="h-4 w-4" /> Schedule
                </Button>
              </div>
              <Link
                to={`/candidate-profile/${candidate.candidateProfileId || 'manager-candidate-1'}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-sm font-semibold shadow-sm transition"
              >
                <BrainCircuitIcon className="h-4 w-4" /> View Full Profile
              </Link>
              <button
              onClick={queueEmail}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              
                <MailIcon className="h-4 w-4" />
                {emailQueued ? 'Email draft queued' : 'Email candidate'}
              </button>
              <section className="mt-7">
                <h3 className="font-display text-base font-bold">
                  Profile snapshot
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {candidate.summary}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {candidate.experience}
                </p>
              </section>
              {candidate.resumeUrl && (
                <section className="mt-7">
                  <h3 className="font-display text-base font-bold">Resume / CV</h3>
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <FileTextIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {candidate.name}’s Resume
                      </p>
                      <p className="text-xs text-slate-500">Resume / CV Document</p>
                    </div>
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      View Document
                    </a>
                  </div>
                </section>
              )}
              <section className="mt-7 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                <div className="flex items-center gap-2">
                  <BrainCircuitIcon className="h-5 w-5 text-brand-600" />
                  <h3 className="font-display text-sm font-bold">
                    AI screening rationale
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {candidate.rationale}
                </p>
              </section>

              {candidate.recommendation && (
                <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BrainCircuitIcon className="h-5 w-5 text-brand-600" />
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        Hiring Manager Review
                      </h3>
                    </div>
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
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommendation</span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                            candidate.recommendation === 'Strong Yes' || candidate.recommendation === 'Yes'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : candidate.recommendation === 'Maybe'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {candidate.recommendation}
                        </span>
                      </div>
                    </div>

                    {candidate.feedback && (
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">Manager Comments</span>
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
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill Ratings</span>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {skills.map((skill) => (
                                <div key={skill} className="rounded-lg bg-white border border-slate-200 p-2.5 text-center">
                                  <p className="text-[10px] font-semibold text-slate-500 truncate">{skill}</p>
                                  <p className="mt-1 text-base font-extrabold text-slate-800">{parsed[skill]} / 5</p>
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

                  {/* Recruiter Action Buttons */}
                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                    <Button
                      onClick={() => onSchedule(candidate)}
                      fullWidth
                      size="sm"
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold"
                    >
                      <CalendarPlusIcon className="h-4 w-4" /> Proceed to Interview
                    </Button>
                    <Button
                      onClick={() => onStageChange(candidate.id, 'Rejected')}
                      variant="outline"
                      fullWidth
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                    >
                      <XIcon className="h-4 w-4" /> Reject Candidate
                    </Button>
                  </div>
                </section>
              )}

              <section className="mt-7">
                <h3 className="font-display text-base font-bold">Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) =>
                <Badge key={skill} tone="brand">
                      {skill}
                    </Badge>
                )}
                </div>
              </section>
              <section className="mt-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold">
                    Recruiter notes
                  </h3>
                  {noteSaved &&
                <span className="text-xs font-semibold text-emerald-600">
                      Saved
                    </span>
                }
                </div>
                <textarea
                defaultValue={candidate.notes}
                aria-label="Recruiter notes"
                className="mt-3 min-h-28 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              
                <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={saveNote}>
                
                  <FileTextIcon className="h-4 w-4" /> Save note
                </Button>
              </section>
              <section className="mt-7 border-t border-slate-100 pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Update stage
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                [
                  'Screening',
                  'Reviewed',
                  'Interview',
                  'Offer',
                  'Rejected'] as
                RecruiterStage[]).
                map((stage) =>
                <button
                  key={stage}
                  onClick={() => onStageChange(candidate.id, stage)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${candidate.stage === stage ? 'bg-slate-900 text-white' : stage === 'Rejected' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  
                      {stage}
                    </button>
                )}
                </div>
              </section>
            </div>
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}