import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlusIcon, Loader2Icon, XIcon } from 'lucide-react';
import type {
  RecruiterCandidate,
  RecruiterInterview,
} from '../../data/recruiter';
import {
  recruiterApi,
  type ScheduleInterviewPayload,
} from '../../services/api';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';

type InterviewType = ScheduleInterviewPayload['interviewType'];

interface ScheduleInterviewModalProps {
  open: boolean;
  candidate: RecruiterCandidate | null;
  candidates: RecruiterCandidate[];
  /** When set, modal updates this existing interview instead of creating one. */
  rescheduleInterview?: RecruiterInterview | null;
  defaultInterviewer?: string;
  onClose: () => void;
  onScheduled: (candidateId: string) => void;
}

function toLocalDateValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toLocalTimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleInterviewModal({
  open,
  candidate,
  candidates,
  rescheduleInterview = null,
  defaultInterviewer = '',
  onClose,
  onScheduled,
}: ScheduleInterviewModalProps) {
  const isReschedule = !!rescheduleInterview;

  const schedulable = useMemo(
    () =>
      candidates.filter(
        (c) =>
          c.applicationId &&
          c.jobId &&
          (c.stage === 'Reviewed' ||
            c.stage === 'Shortlisted' ||
            c.stage === 'Interview' ||
            !!c.recommendation)
      ),
    [candidates]
  );

  const [selectedId, setSelectedId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [interviewType, setInterviewType] = useState<InterviewType>('Video');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [interviewerName, setInterviewerName] = useState(defaultInterviewer);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    if (rescheduleInterview) {
      const at = rescheduleInterview.scheduledAt
        ? new Date(rescheduleInterview.scheduledAt)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);
      setDate(toLocalDateValue(at));
      setTime(toLocalTimeValue(at));
      setDuration(String(rescheduleInterview.durationMinutes || 60));
      setInterviewType(
        (rescheduleInterview.type as InterviewType) || 'Video'
      );
      setMeetingLink(rescheduleInterview.meetingLink || '');
      setLocation(rescheduleInterview.location || '');
      setInterviewerName(
        rescheduleInterview.interviewer || defaultInterviewer
      );
      setNotes(rescheduleInterview.notes || '');
      setSelectedId(rescheduleInterview.applicationId || '');
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setDate(toLocalDateValue(tomorrow));
      setTime(toLocalTimeValue(tomorrow));
      setDuration('60');
      setInterviewType('Video');
      setMeetingLink('');
      setLocation('');
      setInterviewerName(defaultInterviewer);
      setNotes('');
      setSelectedId(candidate?.id ?? schedulable[0]?.id ?? '');
    }

    setError('');
    setLoading(false);
  }, [
    open,
    candidate,
    defaultInterviewer,
    schedulable,
    rescheduleInterview,
  ]);

  const selected =
    isReschedule
      ? null
      : candidate ??
        schedulable.find((c) => c.id === selectedId) ??
        candidates.find((c) => c.id === selectedId) ??
        null;

  const canSubmit = isReschedule
    ? !!rescheduleInterview?.id &&
      !!date &&
      !!time &&
      interviewerName.trim().length > 1 &&
      (interviewType !== 'Video' || meetingLink.trim().length > 0) &&
      (interviewType !== 'Onsite' || location.trim().length > 0)
    : !!selected?.applicationId &&
      !!selected?.jobId &&
      !!date &&
      !!time &&
      interviewerName.trim().length > 1 &&
      (interviewType !== 'Video' || meetingLink.trim().length > 0) &&
      (interviewType !== 'Onsite' || location.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    const scheduledAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      setError('Please pick a valid date and time.');
      setLoading(false);
      return;
    }

    const payload: ScheduleInterviewPayload = {
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: Number(duration) || 60,
      interviewType,
      interviewerName: interviewerName.trim(),
      meetingLink: meetingLink.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (isReschedule && rescheduleInterview) {
        await recruiterApi.rescheduleInterview(rescheduleInterview.id, payload);
        onScheduled(
          rescheduleInterview.applicationId || rescheduleInterview.candidateId
        );
      } else if (selected?.applicationId && selected.jobId) {
        await recruiterApi.scheduleInterview(
          selected.jobId,
          selected.applicationId,
          payload
        );
        onScheduled(selected.id);
      }
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isReschedule
            ? 'Failed to reschedule interview.'
            : 'Failed to schedule interview.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
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
            aria-labelledby="schedule-interview-title"
            className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  id="schedule-interview-title"
                  className="font-display text-xl font-extrabold text-slate-900"
                >
                  {isReschedule ? 'Reschedule interview' : 'Schedule interview'}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {isReschedule
                    ? 'Pick a new time — the candidate will be notified.'
                    : 'Set a time and notify the candidate.'}
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

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              {isReschedule && rescheduleInterview ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">
                      {rescheduleInterview.candidate}
                    </p>
                    {rescheduleInterview.rescheduleRequested && (
                      <Badge tone="amber">Requested by HM</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {rescheduleInterview.role} · currently{' '}
                    {rescheduleInterview.time}
                  </p>
                  {rescheduleInterview.rescheduleReason && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
                      HM note: {rescheduleInterview.rescheduleReason}
                    </p>
                  )}
                </div>
              ) : candidate ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={candidate.avatar}
                    alt=""
                    className="h-11 w-11 rounded-xl"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {candidate.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {candidate.role}
                      {candidate.recommendation
                        ? ` · HM: ${candidate.recommendation}`
                        : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <Select
                  label="Candidate"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">Select a candidate…</option>
                  {schedulable.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.role} ({c.stage})
                    </option>
                  ))}
                </Select>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  min={toLocalDateValue(new Date())}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Input
                  label="Time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </Select>
                <Select
                  label="Type"
                  value={interviewType}
                  onChange={(e) =>
                    setInterviewType(e.target.value as InterviewType)
                  }
                >
                  <option value="Video">Video</option>
                  <option value="Phone">Phone</option>
                  <option value="Onsite">Onsite</option>
                </Select>
              </div>

              {interviewType === 'Video' && (
                <Input
                  label="Meeting link"
                  placeholder="https://meet.google.com/…"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              )}

              {interviewType === 'Onsite' && (
                <Input
                  label="Location"
                  placeholder="Office address or room"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              )}

              <Input
                label="Interviewer"
                placeholder="Hiring manager or recruiter name"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
              />

              <Textarea
                label="Notes for candidate"
                placeholder="Optional agenda or prep notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="border-t border-slate-100 px-6 py-4">
              {error && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button fullWidth variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  fullWidth
                  disabled={!canSubmit || loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />
                      {isReschedule ? 'Saving…' : 'Scheduling…'}
                    </>
                  ) : (
                    <>
                      <CalendarPlusIcon className="h-4 w-4" />
                      {isReschedule
                        ? 'Confirm new time'
                        : 'Confirm interview'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
