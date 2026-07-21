import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlusIcon, Loader2Icon, XIcon, CalendarIcon, ClockIcon, CheckIcon, InfoIcon } from 'lucide-react';
import type {
  RecruiterCandidate,
  RecruiterInterview,
} from '../../data/recruiter';
import {
  recruiterApi,
  type ScheduleInterviewPayload,
  type BusySlot,
  type HiringManager,
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
            c.stage === 'Under Final Review' ||
            !!c.recommendation)
      ),
    [candidates]
  );

  const [selectedId, setSelectedId] = useState('');
  const selected =
    isReschedule
      ? null
      : candidate ??
        schedulable.find((c) => c.id === selectedId) ??
        candidates.find((c) => c.id === selectedId) ??
        null;

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

  const [hiringManagers, setHiringManagers] = useState<HiringManager[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [selectedJobDeptId, setSelectedJobDeptId] = useState<string | null>(null);
  const [selectedJobDeptName, setSelectedJobDeptName] = useState<string | null>(null);

  // Fetch active hiring managers on open
  useEffect(() => {
    if (!open) return;

    recruiterApi.getHiringManagers()
      .then((res) => {
        const activeMgs = res.hiringManagers.filter(hm => hm.isActive);
        setHiringManagers(activeMgs);
      })
      .catch((err) => {
        console.error("Failed to load hiring managers", err);
      });
  }, [open]);

  // Load selected job details to find department
  useEffect(() => {
    const jobId = rescheduleInterview?.jobPostingId || selected?.jobId;
    if (!jobId) {
      setSelectedJobDeptId(null);
      setSelectedJobDeptName(null);
      return;
    }
    recruiterApi.getJobDetails(jobId)
      .then((job) => {
        setSelectedJobDeptId(job.departmentId);
        setSelectedJobDeptName(job.departmentName);
      })
      .catch((err) => {
        console.error("Failed to fetch job details", err);
      });
  }, [selected?.jobId, rescheduleInterview?.jobPostingId, open]);

  // Automatically determine or default the interviewer
  useEffect(() => {
    if (!open || hiringManagers.length === 0) return;

    const initialInterviewer = rescheduleInterview
      ? (rescheduleInterview.interviewer || defaultInterviewer)
      : defaultInterviewer;

    if (initialInterviewer) {
      const matched = hiringManagers.find(
        hm => `${hm.firstName} ${hm.lastName}`.trim().toLowerCase() === initialInterviewer.trim().toLowerCase()
      );
      if (matched) {
        setSelectedManagerId(matched.id);
        setInterviewerName(`${matched.firstName} ${matched.lastName}`);
      } else {
        setSelectedManagerId('custom');
        setInterviewerName(initialInterviewer);
      }
    } else {
      // Prioritize hiring managers in the job's department
      const deptManagers = selectedJobDeptId
        ? hiringManagers.filter(hm => hm.departmentId === selectedJobDeptId)
        : [];

      if (deptManagers.length > 0) {
        setSelectedManagerId(deptManagers[0].id);
        setInterviewerName(`${deptManagers[0].firstName} ${deptManagers[0].lastName}`);
      } else if (hiringManagers.length > 0) {
        setSelectedManagerId(hiringManagers[0].id);
        setInterviewerName(`${hiringManagers[0].firstName} ${hiringManagers[0].lastName}`);
      } else {
        setSelectedManagerId('custom');
        setInterviewerName('');
      }
    }
  }, [open, hiringManagers, selectedJobDeptId, defaultInterviewer, rescheduleInterview]);

  // Fetch availability when selected manager changes
  useEffect(() => {
    if (!selectedManagerId || selectedManagerId === 'custom') {
      setBusySlots([]);
      return;
    }
    setLoadingAvailability(true);
    recruiterApi.getHiringManagerAvailability(selectedManagerId)
      .then((slots) => {
        setBusySlots(slots);
      })
      .catch((err) => console.error("Failed to fetch manager availability", err))
      .finally(() => setLoadingAvailability(false));
  }, [selectedManagerId]);

  const parseISOToDate = (isoStr: string) => {
    if (!isoStr) return new Date();
    if (isoStr.includes('T') && !isoStr.endsWith('Z') && !isoStr.includes('+') && !isoStr.includes('-')) {
      return new Date(isoStr + 'Z');
    }
    return new Date(isoStr);
  };

  const dateBusySlots = useMemo(() => {
    if (!date || busySlots.length === 0) return [];
    return busySlots.filter((slot) => {
      const slotDate = parseISOToDate(slot.scheduledAt);
      const pad = (n: number) => String(n).padStart(2, '0');
      const slotDateString = `${slotDate.getFullYear()}-${pad(slotDate.getMonth() + 1)}-${pad(slotDate.getDate())}`;
      return slotDateString === date;
    });
  }, [date, busySlots]);

  const workingHours = useMemo(() => {
    const durationMinutes = Number(duration) || 60;
    const startHour = 9;
    const endHour = 17;
    
    const slots = [];
    let current = new Date();
    current.setHours(startHour, 0, 0, 0);
    
    const end = new Date();
    end.setHours(endHour, 0, 0, 0);
    
    const pad = (n: number) => String(n).padStart(2, '0');
    
    while (current < end) {
      const timeStr = `${pad(current.getHours())}:${pad(current.getMinutes())}`;
      
      const hrs = current.getHours();
      const mins = current.getMinutes();
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      const label = `${displayHrs}:${pad(mins)} ${ampm}`;
      
      slots.push({ time: timeStr, label });
      
      current = new Date(current.getTime() + durationMinutes * 60 * 1000);
    }
    
    return slots;
  }, [duration]);

  const getSlotStatus = (slotTimeStr: string) => {
    if (!date) return 'unknown';
    
    const slotStart = new Date(`${date}T${slotTimeStr}:00`);
    const durationMinutes = Number(duration) || 60;
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
    
    const isOverlap = dateBusySlots.some((busy) => {
      const busyStart = parseISOToDate(busy.scheduledAt);

      // When rescheduling, exclude the interview being rescheduled from conflict check
      if (isReschedule && rescheduleInterview?.scheduledAt) {
        const rescheduleStart = parseISOToDate(rescheduleInterview.scheduledAt);
        if (Math.abs(busyStart.getTime() - rescheduleStart.getTime()) < 60000) {
          return false;
        }
      }

      const busyEnd = new Date(busyStart.getTime() + busy.durationMinutes * 60 * 1000);
      return busyStart < slotEnd && busyEnd > slotStart;
    });

    return isOverlap ? 'busy' : 'free';
  };

  const filteredHiringManagers = useMemo(() => {
    if (!selectedJobDeptId) return hiringManagers;
    const matched = hiringManagers.filter(hm => hm.departmentId === selectedJobDeptId);
    return matched.length > 0 ? matched : hiringManagers;
  }, [hiringManagers, selectedJobDeptId]);

  const hasDepartmentFilter = selectedJobDeptId && hiringManagers.some(hm => hm.departmentId === selectedJobDeptId);

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

  // Auto-switch to first available free slot when date, manager, duration, or busySlots change
  useEffect(() => {
    if (!date || !selectedManagerId || selectedManagerId === 'custom' || workingHours.length === 0) return;
    const currentStatus = getSlotStatus(time);
    if (currentStatus === 'busy') {
      const firstFree = workingHours.find((s) => getSlotStatus(s.time) === 'free');
      if (firstFree) {
        setTime(firstFree.time);
      }
    }
  }, [date, selectedManagerId, busySlots, duration]);

  const selectedTimeIsBusy = Boolean(
    date && time && selectedManagerId && selectedManagerId !== 'custom' && getSlotStatus(time) === 'busy'
  );

  const canSubmit = isReschedule
    ? !!rescheduleInterview?.id &&
      !!date &&
      !!time &&
      !selectedTimeIsBusy &&
      interviewerName.trim().length > 1 &&
      (interviewType !== 'Video' || meetingLink.trim().length > 0) &&
      (interviewType !== 'Onsite' || location.trim().length > 0)
    : !!selected?.applicationId &&
      !!selected?.jobId &&
      !!date &&
      !!time &&
      !selectedTimeIsBusy &&
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

    const slotStatus = getSlotStatus(time);
    if (slotStatus === 'busy') {
      setError(`Interviewer ${interviewerName.trim()} is already booked for another interview at this time (${time}). Please choose a different time slot or interviewer.`);
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
                <div>
                  <Input
                    label="Time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  {date && time && selectedManagerId && selectedManagerId !== 'custom' && (
                    <div className="mt-1">
                      {selectedTimeIsBusy ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          <XIcon className="h-3 w-3" /> Busy slot (Conflict)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckIcon className="h-3 w-3" /> Slot available
                        </span>
                      )}
                    </div>
                  )}
                </div>
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

              <div className="space-y-1.5">
                <label htmlFor="interviewer-select" className="block text-sm font-medium text-slate-700">
                  Interviewer
                </label>
                <Select
                  id="interviewer-select"
                  value={selectedManagerId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedManagerId(val);
                    if (val === 'custom') {
                      setInterviewerName('');
                    } else {
                      const mgr = hiringManagers.find(hm => hm.id === val);
                      if (mgr) {
                        setInterviewerName(`${mgr.firstName} ${mgr.lastName}`);
                      }
                    }
                  }}
                >
                  <option value="">Select interviewer...</option>
                  {filteredHiringManagers.map((hm) => (
                    <option key={hm.id} value={hm.id}>
                      {hm.firstName} {hm.lastName} (Hiring Manager)
                    </option>
                  ))}
                  <option value="custom">Custom / Other Interviewer</option>
                </Select>

                {/* Department filter notification helper */}
                {selectedJobDeptId && (
                  <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${
                    hasDepartmentFilter ? 'text-brand-600' : 'text-amber-600'
                  }`}>
                    <InfoIcon className="h-3.5 w-3.5" />
                    {hasDepartmentFilter ? (
                      <span>Showing hiring managers assigned to the {selectedJobDeptName} department.</span>
                    ) : (
                      <span>No hiring managers found in the {selectedJobDeptName} department. Showing all.</span>
                    )}
                  </div>
                )}
              </div>

              {selectedManagerId === 'custom' && (
                <Input
                  label="Interviewer Name"
                  placeholder="Enter interviewer's name"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                />
              )}

              {/* Availability helper widget */}
              {selectedManagerId && selectedManagerId !== 'custom' && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                      Interviewer Availability
                    </h4>
                    {loadingAvailability && (
                      <span className="flex items-center text-xs text-slate-400">
                        <Loader2Icon className="mr-1 h-3.5 w-3.5 animate-spin" /> Fetching...
                      </span>
                    )}
                  </div>

                  {!date ? (
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100/50 px-3 py-2 text-xs text-slate-500">
                      <InfoIcon className="h-4 w-4 text-slate-400" />
                      Pick a date to check availability.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {workingHours.map((slot) => {
                        const status = getSlotStatus(slot.time);
                        const isSelected = time === slot.time;
                        const isBusy = status === 'busy';
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={isBusy}
                            onClick={() => setTime(slot.time)}
                            title={isBusy ? `Interviewer is busy at ${slot.label} (Conflict)` : `Select ${slot.label}`}
                            className={`group relative flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all border ${
                              isBusy
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50 select-none'
                                : isSelected
                                  ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-100 scale-105'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-brand-500 hover:bg-brand-50/50'
                            }`}
                          >
                            <span className={`text-xs font-bold ${isBusy ? 'line-through text-slate-400' : ''}`}>
                              {slot.label}
                            </span>
                            <span className={`mt-1 text-[9px] font-bold tracking-wide uppercase ${
                              isBusy
                                ? 'text-red-500'
                                : isSelected
                                  ? 'text-brand-100'
                                  : 'text-emerald-600'
                            }`}>
                              {isBusy ? 'Busy' : 'Free'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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
