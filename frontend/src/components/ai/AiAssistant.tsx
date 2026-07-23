import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BotIcon,
  HistoryIcon,
  Loader2Icon,
  MessageSquarePlusIcon,
  SendHorizonalIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  chatApi,
  type ChatConversationSummary,
  type ChatMessageDto,
} from '../../services/api';

type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function toUiMessages(messages: ChatMessageDto[]): UiMessage[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: m.createdAt,
    }));
}

export function AiAssistant() {
  const { isAuthenticated, user } = useAuth();
  const panelTitleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [greeting, setGreeting] = useState("Hi — I'm Wayfare AI. How can I help?");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, open, scrollToBottom]);

  const loadSuggestions = useCallback(async () => {
    try {
      const res = await chatApi.getSuggestions();
      setGreeting(res.greeting);
      setSuggestions(res.suggestions ?? []);
    } catch {
      setGreeting(`Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''} — how can I help today?`);
      setSuggestions([
        'How do I improve my profile?',
        'How do I apply to a job?',
        'How do I track applications?',
      ]);
    }
  }, [user?.name]);

  const loadConversations = useCallback(async () => {
    try {
      const list = await chatApi.listConversations();
      setConversations(list);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !open) return;
    void loadSuggestions();
    void loadConversations();
  }, [isAuthenticated, open, loadSuggestions, loadConversations]);

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setHistoryOpen(false);
    setInput('');
    inputRef.current?.focus();
  };

  const openConversation = async (id: string) => {
    setLoadingThread(true);
    setError(null);
    setHistoryOpen(false);
    try {
      const detail = await chatApi.getConversation(id);
      setConversationId(detail.id);
      setMessages(toUiMessages(detail.messages));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open conversation.');
    } finally {
      setLoadingThread(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await chatApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) startNewChat();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete conversation.');
    }
  };

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || sending) return;

    setInput('');
    setError(null);
    setSending(true);

    const optimistic: UiMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await chatApi.sendMessage({
        message: text,
        conversationId,
      });
      if (!res?.assistantMessage?.content) {
        throw new Error('No reply received from the assistant. Please try again.');
      }
      setConversationId(res.conversationId);
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimistic.id);
        return [
          ...withoutOptimistic,
          {
            id: res.userMessage.id,
            role: 'user',
            content: res.userMessage.content,
            createdAt: res.userMessage.createdAt,
          },
          {
            id: res.assistantMessage.id,
            role: 'assistant',
            content: res.assistantMessage.content,
            createdAt: res.assistantMessage.createdAt,
          },
        ];
      });
      void loadConversations();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        type="button"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lift ring-1 ring-white/10 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
        aria-controls="ai-assistant-panel"
      >
        {open ? <XIcon className="h-6 w-6" /> : <SparklesIcon className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="ai-assistant-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby={panelTitleId}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed bottom-24 right-4 z-[70] flex h-[min(640px,calc(100vh-7.5rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:right-6"
          >
            {/* Header */}
            <header className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-800 px-4 py-4 text-white">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <BotIcon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 id={panelTitleId} className="font-display text-base font-bold tracking-tight">
                      Wayfare AI
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-300">
                      Your recruitment assistant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHistoryOpen((v) => !v)}
                    className={`rounded-lg p-2 transition-colors hover:bg-white/10 ${historyOpen ? 'bg-white/10' : ''}`}
                    aria-label="Conversation history"
                    title="History"
                  >
                    <HistoryIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={startNewChat}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    aria-label="New chat"
                    title="New chat"
                  >
                    <MessageSquarePlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    aria-label="Close"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            <div className="relative flex min-h-0 flex-1">
              {/* History drawer */}
              <AnimatePresence>
                {historyOpen && (
                  <motion.aside
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -12, opacity: 0 }}
                    className="absolute inset-y-0 left-0 z-10 w-[72%] border-r border-slate-200 bg-slate-50 shadow-soft"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        History
                      </p>
                      <button
                        type="button"
                        onClick={startNewChat}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        New
                      </button>
                    </div>
                    <div className="max-h-full overflow-y-auto p-2 pb-16">
                      {conversations.length === 0 ? (
                        <p className="px-2 py-6 text-center text-xs text-slate-500">
                          No conversations yet.
                        </p>
                      ) : (
                        conversations.map((c) => (
                          <div
                            key={c.id}
                            className={`group mb-1 flex items-start gap-1 rounded-xl px-2 py-2 ${
                              conversationId === c.id ? 'bg-brand-50' : 'hover:bg-white'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => void openConversation(c.id)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {c.title}
                              </p>
                              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                {c.lastMessagePreview || `${c.messageCount} messages`}
                              </p>
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteConversation(c.id)}
                              className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                              aria-label={`Delete ${c.title}`}
                            >
                              <Trash2Icon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {loadingThread ? (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Loader2Icon className="h-5 w-5 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col justify-center">
                      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <SparklesIcon className="h-4 w-4 text-brand-600" aria-hidden />
                          {greeting}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                          Ask about jobs, profiles, applications, hiring workflows, or platform navigation.
                        </p>
                      </div>
                      <div className="mt-4 grid gap-2">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => void send(s)}
                            disabled={sending}
                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-800 disabled:opacity-50"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                            m.role === 'user'
                              ? 'rounded-br-md bg-slate-900 text-white'
                              : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <p
                            className={`mt-1.5 text-[10px] ${
                              m.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  {sending && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
                        <Loader2Icon className="h-4 w-4 animate-spin text-brand-600" />
                        Thinking…
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <p role="alert" className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                {/* Composer */}
                <div className="border-t border-slate-100 bg-white p-3">
                  <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value.slice(0, 4000))}
                      onKeyDown={onKeyDown}
                      rows={1}
                      placeholder="Ask Wayfare AI…"
                      disabled={sending}
                      className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-1.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                      aria-label="Message"
                    />
                    <button
                      type="button"
                      onClick={() => void send()}
                      disabled={sending || !input.trim()}
                      className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Send message"
                    >
                      {sending ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <SendHorizonalIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-slate-400">
                    AI can make mistakes. Verify important hiring decisions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
