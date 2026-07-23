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
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Info Section */}
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isConnected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base font-bold text-slate-900">
                Google Calendar Integration
              </h3>
              {isConnected ? (
                <Badge tone="green">
                  <CheckCircle2Icon className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge tone="neutral">Not Connected</Badge>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {isConnected
                ? `Synced to ${status?.googleEmail || 'your Google account'}. Scheduled interviews sync directly to Google Calendar.`
                : 'Connect your Google account to automatically sync interview invitations, Google Meet links, and reminders.'}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-auto">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAutoSync}
                disabled={togglingAutoSync}
                className="gap-1.5 text-xs"
              >
                {togglingAutoSync ? (
                  <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Settings2Icon className="h-3.5 w-3.5 text-slate-500" />
                )}
                Auto-sync: {status?.autoSyncInterviews ? 'ON' : 'OFF'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                disabled={syncing}
                className="gap-1.5 text-xs text-slate-700 hover:text-slate-900"
              >
                {syncing ? (
                  <Loader2Icon className="h-3.5 w-3.5 animate-spin text-brand-600" />
                ) : (
                  <RefreshCwIcon className="h-3.5 w-3.5 text-brand-600" />
                )}
                Sync All Interviews
              </Button>

              <button
                onClick={handleDisconnect}
                className="flex items-center gap-1 rounded-lg p-2 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                title="Disconnect Google Calendar"
              >
                <UnplugIcon className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <Button size="sm" onClick={handleConnect} disabled={connecting} className="gap-2 text-xs font-semibold">
              {connecting ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarDaysIcon className="h-4 w-4" />
              )}
              {connecting ? 'Connecting...' : 'Connect Google Calendar'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

