import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck2Icon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Loader2Icon,
  RefreshCwIcon,
  Settings2Icon,
  UnplugIcon,
} from 'lucide-react';
import { googleCalendarApi, type GoogleCalendarStatus } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface GoogleCalendarCardProps {
  status: GoogleCalendarStatus | null;
  onOpenConnectModal?: () => void;
  onStatusChange: (status: GoogleCalendarStatus | null) => void;
  onMessage: (msg: string) => void;
  onSyncComplete?: () => void;
}

export function GoogleCalendarCard({
  status,
  onStatusChange,
  onMessage,
  onSyncComplete,
}: GoogleCalendarCardProps) {

  const [syncing, setSyncing] = useState(false);
  const [togglingAutoSync, setTogglingAutoSync] = useState(false);

  const isConnected = status?.isConnected ?? false;

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const res = await googleCalendarApi.syncAllInterviews();
      onMessage(res.message || 'Interviews synced to Google Calendar!');
      onSyncComplete?.();
    } catch (err: unknown) {
      onMessage(
        err instanceof Error ? err.message : 'Failed to sync interviews.'
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleAutoSync = async () => {
    if (!status) return;
    setTogglingAutoSync(true);
    try {
      const nextAutoSync = !status.autoSyncInterviews;
      const res = await googleCalendarApi.updateSettings({
        autoSyncInterviews: nextAutoSync,
        calendarId: status.calendarId,
      });
      onStatusChange(res.data);
      onMessage(
        nextAutoSync
          ? 'Auto-sync enabled for Google Calendar.'
          : 'Auto-sync disabled.'
      );
    } catch {
      onMessage('Failed to update settings.');
    } finally {
      setTogglingAutoSync(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Calendar?')) return;
    try {
      await googleCalendarApi.disconnect();
      onStatusChange({
        isConnected: false,
        autoSyncInterviews: true,
        calendarId: 'primary',
        clientIdConfigured: status?.clientIdConfigured ?? false,
      });
      onMessage('Google Calendar disconnected.');
    } catch {
      onMessage('Failed to disconnect Google Calendar.');
    }
  };

  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (status?.authUrl) {
      window.location.href = status.authUrl;
      return;
    }

    setConnecting(true);
    try {
      const res = await googleCalendarApi.connect();
      onStatusChange(res.data);
      onMessage('Google Calendar connected successfully! 🎉');
    } catch {
      onMessage('Failed to connect Google Calendar.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white transition-all"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Info Section */}
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isConnected
                ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-300'
            }`}
          >
            {isConnected ? (
              <CalendarCheck2Icon className="h-6 w-6 text-emerald-400" />
            ) : (
              <CalendarDaysIcon className="h-6 w-6 text-teal-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base font-extrabold text-white">
                Google Calendar Sync
              </h3>
              {isConnected ? (
                <Badge tone="green" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  <CheckCircle2Icon className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge tone="slate" className="bg-slate-800 text-slate-300 border-slate-700">Not Connected</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              {isConnected
                ? 'Sync manager interviews directly to your primary Google Calendar and receive automatic updates.'
                : 'Connect your Google account to automatically push interview schedules into your Google Calendar.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:shrink-0">
          {isConnected ? (
            <>
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncing}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCwIcon className="h-3.5 w-3.5" /> Sync All Now
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleAutoSync}
                disabled={togglingAutoSync}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  status?.autoSyncInterviews
                    ? 'border-teal-400/40 bg-brand-600/30 text-teal-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle automatic synchronization when interviews are scheduled or updated"
              >
                <Settings2Icon className="h-3.5 w-3.5" />
                Auto-sync: {status?.autoSyncInterviews ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-950/60 text-red-300 hover:bg-red-900/80 px-2.5 py-2 text-xs font-bold transition"
                title="Disconnect Google Calendar"
              >
                <UnplugIcon className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {connecting ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  <CalendarDaysIcon className="h-4 w-4" /> Connect Google Calendar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
