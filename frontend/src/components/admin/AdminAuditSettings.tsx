import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  HistoryIcon,
  Loader2Icon,
  SaveIcon,
  SearchIcon,
  Settings2Icon,
  XCircleIcon,
} from 'lucide-react';
import { adminApi, type AuditLogEntry, type SystemSettingEntry } from '../../services/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function moduleTone(module: string): string {
  switch (module.toLowerCase()) {
    case 'auth':      return 'bg-brand-100 text-brand-700';
    case 'jobs':      return 'bg-teal-100 text-teal-700';
    case 'users':     return 'bg-purple-100 text-purple-700';
    case 'settings':  return 'bg-amber-100 text-amber-700';
    case 'candidates':return 'bg-sky-100 text-sky-700';
    default:          return 'bg-slate-100 text-slate-700';
  }
}

function actionTone(action: string): string {
  if (/delete|remove|reject/i.test(action)) return 'text-red-500';
  if (/login|register|invite/i.test(action)) return 'text-brand-600';
  if (/approve|hire|enable/i.test(action))   return 'text-emerald-600';
  if (/update|change|reset/i.test(action))   return 'text-amber-600';
  return 'text-slate-600';
}

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// Determine if a setting should render as a toggle vs text/number input
function isBoolSetting(value: string): boolean {
  return value === 'true' || value === 'false';
}

function isNumericSetting(value: string): boolean {
  return !isBoolSetting(value) && !isNaN(Number(value));
}

// ─── Audit Log Tab ───────────────────────────────────────────────────────────

function AuditLogTab() {
  const [logs, setLogs]           = useState<AuditLogEntry[]>([]);
  const [modules, setModules]     = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [module, setModule]       = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  // debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getAuditLogs(page, PAGE_SIZE, debouncedSearch || undefined, module || undefined);
      setLogs(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages ?? Math.ceil(res.totalCount / PAGE_SIZE));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, module]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    adminApi.getAuditModules()
      .then(setModules)
      .catch(() => setModules([]));
  }, []);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search action, user, IP, module…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative w-48">
          <select
            value={module}
            onChange={e => { setModule(e.target.value); setPage(1); }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Count */}
      <p className="mt-3 text-sm text-slate-500">
        <span className="font-semibold text-slate-800">{totalCount.toLocaleString()}</span> events
        {(debouncedSearch || module) ? ' matching filters' : ' total'}
      </p>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        {error ? (
          <div className="flex items-center gap-2.5 px-5 py-8 text-sm font-medium text-red-600">
            <AlertCircleIcon className="h-5 w-5 shrink-0" /> {error}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="h-7 w-7 animate-spin text-brand-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            No audit events match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 w-40">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3 w-24">Module</th>
                  <th className="px-4 py-3 w-28">IP Address</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatTs(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{log.userName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-bold ${actionTone(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold ${moduleTone(log.module)}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {log.details ? (
                        <span className="block truncate text-xs text-slate-600" title={log.details}>
                          {log.details}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Page <span className="font-bold text-slate-700">{page}</span> of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── System Settings Tab ─────────────────────────────────────────────────────

function SystemSettingsTab() {
  const [settings, setSettings]   = useState<SystemSettingEntry[]>([]);
  const [draft, setDraft]         = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    setLoading(true);
    adminApi.getSettings()
      .then(data => {
        setSettings(data);
        const initial: Record<string, string> = {};
        data.forEach(s => { initial[s.key] = s.value; });
        setDraft(initial);
      })
      .catch(err => setError(err?.message ?? 'Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const hasChanges = settings.some(s => draft[s.key] !== s.value);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const changed = settings
        .filter(s => draft[s.key] !== s.value)
        .map(s => ({ key: s.key, value: draft[s.key] }));

      const res = await adminApi.updateSettings(changed);
      setSettings(res.data);
      const updated: Record<string, string> = {};
      res.data.forEach(s => { updated[s.key] = s.value; });
      setDraft(updated);
      setSuccess(`${changed.length} setting${changed.length === 1 ? '' : 's'} saved successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const setValue = (key: string, value: string) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2Icon className="h-7 w-7 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
          <AlertCircleIcon className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-700">
          <CheckCircle2Icon className="h-5 w-5 shrink-0" /> {success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {settings.map(setting => {
          const currentVal = draft[setting.key] ?? setting.value;
          const isBool    = isBoolSetting(setting.value);
          const isNum     = !isBool && isNumericSetting(setting.value);
          const isDirty   = currentVal !== setting.value;

          return (
            <div
              key={setting.key}
              className={`rounded-2xl border bg-white p-5 shadow-soft transition-colors ${isDirty ? 'border-brand-300 ring-1 ring-brand-200' : 'border-slate-200'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-mono text-xs font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                      {setting.key}
                    </p>
                    {isDirty && (
                      <span className="text-[10px] font-bold text-brand-600 bg-brand-50 rounded px-1.5 py-0.5">
                        modified
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {setting.description}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Last updated {new Date(setting.updatedAt).toLocaleDateString()} by {setting.updatedBy}
                  </p>
                </div>

                {/* Control */}
                {isBool ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={currentVal === 'true'}
                    aria-label={setting.key}
                    onClick={() => setValue(setting.key, currentVal === 'true' ? 'false' : 'true')}
                    className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${currentVal === 'true' ? 'bg-brand-600' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${currentVal === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                ) : (
                  <input
                    type={isNum ? 'number' : 'text'}
                    value={currentVal}
                    min={isNum ? 0 : undefined}
                    onChange={e => setValue(setting.key, e.target.value)}
                    className="w-24 shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-right text-sm font-semibold text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save bar */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-soft">
        <span className="text-sm text-slate-500">
          {hasChanges
            ? `${settings.filter(s => draft[s.key] !== s.value).length} unsaved change(s)`
            : 'All settings saved'}
        </span>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? <Loader2Icon className="h-4 w-4 animate-spin" />
            : <SaveIcon className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

// ─── Main exported component ─────────────────────────────────────────────────

export function AdminAuditSettings() {
  const [tab, setTab] = useState<'audit' | 'settings'>('audit');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1400px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      {/* Page header */}
      <div>
        <p className="text-sm font-medium text-slate-500">Governance controls</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          Audit & Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor platform activity and manage system configuration.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mt-6 flex gap-1 rounded-2xl border border-slate-200 bg-slate-100/60 p-1 w-fit">
        <button
          onClick={() => setTab('audit')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === 'audit'
              ? 'bg-white shadow-soft text-brand-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HistoryIcon className="h-4 w-4" />
          Audit Logs
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === 'settings'
              ? 'bg-white shadow-soft text-brand-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings2Icon className="h-4 w-4" />
          System Settings
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {tab === 'audit'    && <AuditLogTab />}
        {tab === 'settings' && <SystemSettingsTab />}
      </div>
    </motion.div>
  );
}
