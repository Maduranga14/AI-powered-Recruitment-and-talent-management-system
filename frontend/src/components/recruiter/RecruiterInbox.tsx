import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArchiveIcon,
  CheckCheckIcon,
  MailPlusIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SendIcon } from
'lucide-react';
import type { RecruiterMessage } from '../../data/recruiter';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
interface RecruiterInboxProps {
  messages: RecruiterMessage[];
}
export function RecruiterInbox({ messages }: RecruiterInboxProps) {
  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [sent, setSent] = useState(false);
  const visible = messages.filter((message) =>
  [message.sender, message.subject, message.preview].
  join(' ').
  toLowerCase().
  includes(query.toLowerCase())
  );
  const selected =
  messages.find((message) => message.id === selectedId) ?? visible[0];
  const sendReply = () => {
    setSent(true);
    window.setTimeout(() => setSent(false), 2200);
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Communication center
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Inbox
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Candidate conversations, team feedback, and AI updates in one place.
          </p>
        </div>
        <Button onClick={() => setSent(false)}>
          <MailPlusIcon className="h-4 w-4" /> New message
        </Button>
      </div>
      <section
        className="mt-7 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft lg:grid-cols-[360px_1fr]"
        aria-label="Recruiter inbox">
        
        <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 p-4">
            <label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3">
              <SearchIcon className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search inbox"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                aria-label="Search inbox" />
              
            </label>
          </div>
          <div className="max-h-[580px] overflow-y-auto">
            {visible.map((message) =>
            <button
              key={message.id}
              onClick={() => setSelectedId(message.id)}
              className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition-colors ${selected?.id === message.id ? 'bg-brand-50/70' : 'hover:bg-slate-50'}`}>
              
                <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${message.tone === 'brand' ? 'bg-brand-100 text-brand-700' : message.tone === 'accent' ? 'bg-accent-100 text-accent-700' : message.tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                
                  {message.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                    className={`truncate text-sm ${message.unread ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    
                      {message.sender}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {message.time}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold text-slate-600">
                    {message.subject}
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {message.preview}
                  </span>
                </span>
                {message.unread &&
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              }
              </button>
            )}
            {!visible.length &&
            <p className="p-8 text-center text-sm text-slate-500">
                No messages found.
              </p>
            }
          </div>
        </div>
        {selected ?
        <article className="flex min-h-[580px] flex-col">
            <header className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-bold">
                    {selected.subject}
                  </h2>
                  <Badge tone={selected.tone}>
                    {selected.sender === 'Talenta AI' ?
                  'AI update' :
                  'Conversation'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  From {selected.sender} · {selected.time} ago
                </p>
              </div>
              <button
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              aria-label="More message actions">
              
                <MoreHorizontalIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 p-5 sm:p-6">
              <p className="text-sm leading-7 text-slate-700">
                {selected.preview}
              </p>
              <p className="mt-5 text-sm leading-7 text-slate-700">
                I’m excited to continue the conversation. Please let me know if
                there’s anything else you would like me to share before the next
                step.
              </p>
              <p className="mt-6 text-sm font-medium text-slate-700">
                Best,
                <br />
                {selected.sender}
              </p>
            </div>
            <footer className="border-t border-slate-100 p-5 sm:p-6">
              <textarea
              className="min-h-24 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder={`Reply to ${selected.sender}…`}
              aria-label={`Reply to ${selected.sender}`} />
            
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                  <ArchiveIcon className="h-4 w-4" /> Archive
                </button>
                <div className="flex items-center gap-3">
                  {sent &&
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                      <CheckCheckIcon className="h-4 w-4" /> Reply queued
                    </span>
                }
                  <Button size="sm" onClick={sendReply}>
                    <SendIcon className="h-4 w-4" /> Send reply
                  </Button>
                </div>
              </div>
            </footer>
          </article> :

        <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">
            Select a message to read it.
          </div>
        }
      </section>
    </motion.div>);

}