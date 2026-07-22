import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArchiveIcon,
  CalendarClockIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  MailIcon,
  MailOpenIcon,
  MailPlusIcon,
  SearchIcon,
  SparklesIcon,
  UserCheckIcon,
  XCircleIcon,
} from 'lucide-react';
import type { RecruiterCandidate, RecruiterInterview } from '../../data/recruiter';
import { Badge } from '../ui/Badge';

// ─── Derived message types ────────────────────────────────────────────────────

type MessageCategory = 'all' | 'candidates' | 'interviews' | 'system';

interface InboxMessage {
  id: string;
  category: MessageCategory;
  sender: string;
  senderInitials: string;
  senderColor: string;
  subject: string;
  body: string;
  time: string;
  unread: boolean;
  tag?: string;
  tagTone?: 'green' | 'amber' | 'red' | 'brand' | 'blue' | 'slate';
  candidateStage?: string;
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function buildMessages(
  candidates: RecruiterCandidate[],
  interviews: RecruiterInterview[],
): InboxMessage[] {
  const msgs: InboxMessage[] = [];

  // ── Reschedule requests from hiring managers ──────────────────────────────
  interviews
    .filter(i => i.rescheduleRequested)
    .forEach(i => {
      msgs.push({
        id: `reschedule-${i.id}`,
        category: 'interviews',
        sender: i.interviewer,
        senderInitials: initials(i.interviewer),
        senderColor: 'bg-amber-100 text-amber-700',
        subject: `Reschedule requested — ${i.candidate}`,
        body: i.rescheduleReason
          ? `"${i.rescheduleReason}" — ${i.interviewer} has requested a new time for the ${i.type} interview with ${i.candidate} (${i.role}).`
          : `${i.interviewer} has requested to reschedule the ${i.type} interview with ${i.candidate} for ${i.role}.`,
        time: 'Today',
        unread: true,
        tag: 'Reschedule',
        tagTone: 'amber',
      });
    });

  // ── Upcoming interviews (next 48 h) ────────────────────────────────────────
  const soon = Date.now() + 48 * 3600 * 1000;
  interviews
    .filter(i => !i.rescheduleRequested && i.scheduledAt && new Date(i.scheduledAt).getTime() < soon && new Date(i.scheduledAt).getTime() > Date.now())
    .slice(0, 3)
    .forEach(i => {
      msgs.push({
        id: `upcoming-${i.id}`,
        category: 'interviews',
        sender: i.candidate,
        senderInitials: initials(i.candidate),
        senderColor: 'bg-brand-100 text-brand-700',
        subject: `Upcoming: ${i.type} interview — ${i.role}`,
        body: `${i.candidate} has a ${i.duration} ${i.type.toLowerCase()} interview scheduled for ${i.time}. Interviewer: ${i.interviewer}.${i.meetingLink ? ` Meeting link: ${i.meetingLink}` : ''}`,
        time: i.time,
        unread: false,
        tag: 'Upcoming',
        tagTone: 'brand',
      });
    });

  // ── Shortlisted candidates awaiting HM review ─────────────────────────────
  const shortlisted = candidates.filter(c => c.stage === 'Shortlisted');
  if (shortlisted.length > 0) {
    msgs.push({
      id: 'shortlisted-batch',
      category: 'candidates',
      sender: 'Pipeline update',
      senderInitials: 'PL',
      senderColor: 'bg-teal-100 text-teal-700',
      subject: `${shortlisted.length} candidate${shortlisted.length > 1 ? 's' : ''} shortlisted — awaiting HM review`,
      body: `${shortlisted.map(c => c.name).join(', ')} ${shortlisted.length === 1 ? 'has' : 'have'} been shortlisted and ${shortlisted.length === 1 ? 'is' : 'are'} pending hiring manager review before scheduling interviews.`,
      time: 'Today',
      unread: shortlisted.length > 0,
      tag: 'Action needed',
      tagTone: 'amber',
    });
  }

  // ── Reviewed candidates ready for interview scheduling ───────────────────
  const reviewed = candidates.filter(c => c.stage === 'Reviewed');
  if (reviewed.length > 0) {
    msgs.push({
      id: 'reviewed-batch',
      category: 'candidates',
      sender: 'Pipeline update',
      senderInitials: 'PL',
      senderColor: 'bg-teal-100 text-teal-700',
      subject: `${reviewed.length} candidate${reviewed.length > 1 ? 's' : ''} reviewed — ready to schedule interview`,
      body: `Hiring manager has reviewed: ${reviewed.map(c => c.name).join(', ')}. ${reviewed.length === 1 ? 'This candidate is' : 'These candidates are'} ready for interview scheduling.`,
      time: 'Today',
      unread: reviewed.length > 0,
      tag: 'Schedule now',
      tagTone: 'green',
    });
  }

  // ── Hired candidates ────────────────────────────────────────────────────────
  const hired = candidates.filter(c => c.stage === 'Offer');
  hired.slice(0, 3).forEach(c => {
    msgs.push({
      id: `hired-${c.id}`,
      category: 'candidates',
      sender: c.name,
      senderInitials: initials(c.name),
      senderColor: 'bg-emerald-100 text-emerald-700',
      subject: `Offer extended — ${c.name} · ${c.role}`,
      body: `${c.name} has been marked as Hired for the ${c.role} role. An offer notification email has been sent to ${c.email}. Please follow up with onboarding steps.`,
      time: 'Recent',
      unread: false,
      tag: 'Hired',
      tagTone: 'green',
      candidateStage: 'Offer',
    });
  });

  // ── Rejected candidates ─────────────────────────────────────────────────────
  const rejected = candidates.filter(c => c.stage === 'Rejected');
  if (rejected.length > 0) {
    msgs.push({
      id: 'rejected-batch',
      category: 'candidates',
      sender: 'Pipeline update',
      senderInitials: 'PL',
      senderColor: 'bg-slate-100 text-slate-600',
      subject: `${rejected.length} candidate${rejected.length > 1 ? 's' : ''} rejected`,
      body: `${rejected.map(c => c.name).join(', ')} ${rejected.length === 1 ? 'has' : 'have'} been marked as rejected. Rejection notification emails have been sent.`,
      time: 'Recent',
      unread: false,
      tag: 'Closed',
      tagTone: 'slate',
    });
  }

  // ── Under Final Review ───────────────────────────────────────────────────────
  const finalReview = candidates.filter(c => c.stage === 'Under Final Review');
  if (finalReview.length > 0) {
    msgs.push({
      id: 'final-review-batch',
      category: 'candidates',
      sender: 'Pipeline update',
      senderInitials: 'PL',
      senderColor: 'bg-purple-100 text-purple-700',
      subject: `${finalReview.length} candidate${finalReview.length > 1 ? 's' : ''} under final review`,
      body: `${finalReview.map(c => c.name).join(', ')} ${finalReview.length === 1 ? 'has' : 'have'} completed interviews and ${finalReview.length === 1 ? 'is' : 'are'} pending a final hiring decision from the hiring manager.`,
      time: 'Today',
      unread: true,
      tag: 'Awaiting decision',
      tagTone: 'brand',
    });
  }

  // ── System / AI notifications ─────────────────────────────────────────────
  msgs.push({
    id: 'system-platform',
    category: 'system',
    sender: 'TalentPortal AI',
    senderInitials: 'AI',
    senderColor: 'bg-brand-100 text-brand-700',
    subject: 'Platform activity summary',
    body: `You currently have ${candidates.length} applicants across your job postings. ${shortlisted.length} are shortlisted, ${interviews.length} interviews are scheduled, and ${hired.length} candidates have been hired.`,
    time: 'Today',
    unread: false,
    tag: 'Summary',
    tagTone: 'blue',
  });

  if (interviews.length > 0) {
    msgs.push({
      id: 'system-interviews',
      category: 'system',
      sender: 'TalentPortal AI',
      senderInitials: 'AI',
      senderColor: 'bg-brand-100 text-brand-700',
      subject: `${interviews.length} interview${interviews.length > 1 ? 's' : ''} scheduled this week`,
      body: `You have ${interviews.length} interview${interviews.length > 1 ? 's' : ''} on your calendar. ${interviews.filter(i => i.rescheduleRequested).length} ${interviews.filter(i => i.rescheduleRequested).length === 1 ? 'has' : 'have'} a reschedule request pending your attention.`,
      time: 'Today',
      unread: interviews.some(i => i.rescheduleRequested),
      tag: 'Interviews',
      tagTone: 'brand',
    });
  }

  // Sort: unread first, then by insertion order
  return msgs.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));
}

// ─── Category icon map ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  candidates: UserCheckIcon,
  interviews: CalendarClockIcon,
  system: SparklesIcon,
};

// ─── Main component ───────────────────────────────────────────────────────────

interface RecruiterInboxProps {
  candidates?: RecruiterCandidate[];
  interviews?: RecruiterInterview[];
}

export function RecruiterInbox({ candidates = [], interviews = [] }: RecruiterInboxProps) {
  const allMessages = useMemo(() => buildMessages(candidates, interviews), [candidates, interviews]);

  const [readIds, setReadIds]     = useState<Set<string>>(new Set());
  const [archivedIds, setArchived] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(allMessages[0]?.id ?? null);
  const [query, setQuery]          = useState('');
  const [category, setCategory]    = useState<MessageCategory>('all');
  const [replying, setReplying]    = useState(false);
  const [replyText, setReplyText]  = useState('');
  const [sentIds, setSentIds]      = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    return allMessages.filter(m => {
      if (archivedIds.has(m.id)) return false;
      if (category !== 'all' && m.category !== category) return false;
      if (!query.trim()) return true;
      return [m.sender, m.subject, m.body].join(' ').toLowerCase().includes(query.toLowerCase());
    });
  }, [allMessages, query, category, archivedIds]);

  const selected = visible.find(m => m.id === selectedId) ?? visible[0] ?? null;

  const isUnread  = (id: string) => !readIds.has(id) && allMessages.find(m => m.id === id)?.unread;
  const unreadCount = visible.filter(m => isUnread(m.id)).length;

  const markRead = (id: string) => setReadIds(prev => new Set(prev).add(id));
  const archive  = (id: string) => {
    setArchived(prev => new Set(prev).add(id));
    if (selectedId === id) setSelectedId(visible.find(m => m.id !== id)?.id ?? null);
  };
  const markAllRead = () => setReadIds(new Set(allMessages.map(m => m.id)));

  const sendReply = () => {
    if (!selected || !replyText.trim()) return;
    setSentIds(prev => new Set(prev).add(selected.id));
    setReplyText('');
    setReplying(false);
    markRead(selected.id);
    setTimeout(() => setSentIds(prev => { const n = new Set(prev); n.delete(selected!.id); return n; }), 3000);
  };

  const CategoryIcon = selected ? (CATEGORY_ICONS[selected.category] ?? MailIcon) : MailIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Communication center</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Inbox</h1>
          <p className="mt-2 text-sm text-slate-500">
            Candidate pipeline updates, interview alerts, and AI notifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <CheckCheckIcon className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-5 flex gap-1 rounded-2xl border border-slate-200 bg-slate-100/60 p-1 w-fit">
        {(['all', 'candidates', 'interviews', 'system'] as MessageCategory[]).map(cat => {
          const count = cat === 'all'
            ? allMessages.filter(m => !archivedIds.has(m.id) && isUnread(m.id)).length
            : allMessages.filter(m => !archivedIds.has(m.id) && m.category === cat && isUnread(m.id)).length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold capitalize transition-colors ${
                category === cat ? 'bg-white shadow-soft text-brand-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main panel */}
      <section
        className="mt-5 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft lg:grid-cols-[340px_1fr]"
        aria-label="Recruiter inbox"
      >
        {/* Message list */}
        <div className="flex flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 p-3">
            <label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3">
              <SearchIcon className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search inbox…"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <XCircleIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </label>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MailOpenIcon className="h-9 w-9 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-500">All caught up</p>
                <p className="mt-1 text-xs text-slate-400">No messages match your filters.</p>
              </div>
            ) : (
              visible.map(msg => {
                const active  = selected?.id === msg.id;
                const unread  = isUnread(msg.id);
                return (
                  <button
                    key={msg.id}
                    onClick={() => { setSelectedId(msg.id); markRead(msg.id); setReplying(false); }}
                    className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-100 last:border-0 ${
                      active ? 'bg-brand-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${msg.senderColor}`}>
                      {msg.senderInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm ${unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {msg.sender}
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-400">{msg.time}</span>
                      </div>
                      <p className={`mt-0.5 truncate text-xs ${unread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                        {msg.subject}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{msg.body}</p>
                    </div>
                    {unread && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message detail */}
        {selected ? (
          <div className="flex flex-col">
            {/* Detail header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${selected.senderColor}`}>
                  {selected.senderInitials}
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-extrabold text-slate-900 leading-tight">
                    {selected.subject}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-500">From <span className="font-semibold text-slate-700">{selected.sender}</span></span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{selected.time}</span>
                    {selected.tag && (
                      <Badge tone={selected.tagTone ?? 'slate'}>{selected.tag}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => archive(selected.id)}
                  title="Archive"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <ArchiveIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${selected.senderColor}`}>
                  <CategoryIcon className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 capitalize">
                  {selected.category}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
                <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                  {selected.body}
                </p>
              </div>

              {/* Context cards based on category */}
              {selected.category === 'candidates' && (
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-slate-900">{candidates.length}</p>
                    <p className="mt-0.5 text-xs text-slate-500">Total applicants</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-amber-600">
                      {candidates.filter(c => c.stage === 'Shortlisted' || c.stage === 'Reviewed').length}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">Pending action</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-emerald-600">
                      {candidates.filter(c => c.stage === 'Offer').length}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">Hired</p>
                  </div>
                </div>
              )}

              {selected.category === 'interviews' && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-brand-700">{interviews.length}</p>
                    <p className="mt-0.5 text-xs text-slate-500">Scheduled interviews</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-amber-700">
                      {interviews.filter(i => i.rescheduleRequested).length}
                    </p>
                    <p className="mt-0.5 text-xs text-amber-600">Reschedule requests</p>
                  </div>
                </div>
              )}

              {/* Sent confirmation */}
              <AnimatePresence>
                {sentIds.has(selected.id) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700"
                  >
                    <CheckCircle2Icon className="h-5 w-5" /> Reply sent successfully.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reply area */}
            <div className="border-t border-slate-100 p-4 sm:p-5">
              {replying ? (
                <div className="space-y-3">
                  <textarea
                    autoFocus
                    rows={3}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selected.sender}…`}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={sendReply}
                      disabled={!replyText.trim()}
                      className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                    >
                      <MailPlusIcon className="h-4 w-4" /> Send reply
                    </button>
                    <button
                      onClick={() => { setReplying(false); setReplyText(''); }}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplying(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <MailPlusIcon className="h-4 w-4 text-slate-400" /> Reply
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MailOpenIcon className="h-12 w-12 text-slate-200" />
            <p className="mt-4 font-semibold text-slate-500">Select a message to read</p>
          </div>
        )}
      </section>
    </motion.div>
  );
}
