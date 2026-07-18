import React, { useState, useEffect, useCallback } from 'react';
import {
  UsersIcon,
  MailIcon,
  UserCheckIcon,
  UserXIcon,
  RefreshCwIcon,
  Trash2Icon,
  UserPlusIcon,
  ClockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Loader2Icon,
} from 'lucide-react';
import {
  recruiterApi,
  type HiringManager,
  type HiringManagerInvitation,
} from '../../services/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InviteHiringManagerModal } from './InviteHiringManagerModal';

export function RecruiterHiringManagers() {
  const [hiringManagers, setHiringManagers] = useState<HiringManager[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<HiringManagerInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'invites'>('active');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const startLoadingId = (id: string) => setLoadingIds((prev) => [...prev, id]);
  const stopLoadingId = (id: string) => setLoadingIds((prev) => prev.filter((item) => item !== id));
  const isIdLoading = (id: string) => loadingIds.includes(id);

  const fetchHiringManagers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await recruiterApi.getHiringManagers();
      setHiringManagers(res.hiringManagers);
      setPendingInvitations(res.pendingInvitations);
    } catch (err: any) {
      console.error('[HiringManagers] failed to load data:', err);
      setError(err?.message ?? 'Failed to load team directory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHiringManagers();
  }, [fetchHiringManagers]);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleStatus = async (manager: HiringManager) => {
    startLoadingId(manager.id);
    try {
      const res = await recruiterApi.toggleHiringManagerStatus(manager.id);
      setHiringManagers((prev) =>
        prev.map((item) => (item.id === manager.id ? { ...item, isActive: res.isActive } : item))
      );
      showFeedback(
        `"${manager.firstName} ${manager.lastName}" has been ${
          res.isActive ? 'activated' : 'deactivated'
        }.`
      );
    } catch (err: any) {
      setError(err?.message ?? 'Failed to toggle status.');
    } finally {
      stopLoadingId(manager.id);
    }
  };

  const handleResendInvitation = async (invitation: HiringManagerInvitation) => {
    startLoadingId(invitation.id);
    try {
      const res = await recruiterApi.resendInvitation(invitation.id);
      // Refresh the invitations list
      const freshData = await recruiterApi.getHiringManagers();
      setPendingInvitations(freshData.pendingInvitations);
      showFeedback(res.message || `Invitation resent to ${invitation.email}.`);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to resend invitation.');
    } finally {
      stopLoadingId(invitation.id);
    }
  };

  const handleRevokeInvitation = async (invitation: HiringManagerInvitation) => {
    if (!window.confirm(`Are you sure you want to revoke the invitation for ${invitation.email}?`)) {
      return;
    }
    startLoadingId(invitation.id);
    try {
      await recruiterApi.revokeInvitation(invitation.id);
      setPendingInvitations((prev) => prev.filter((item) => item.id !== invitation.id));
      showFeedback(`Invitation for ${invitation.email} has been revoked.`);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to revoke invitation.');
    } finally {
      stopLoadingId(invitation.id);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Team Management
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Invite and manage hiring managers who participate in candidate reviews and interviews.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="w-full sm:w-auto">
          <UserPlusIcon className="h-4.5 w-4.5" />
          Invite Manager
        </Button>
      </div>

      {/* Tabs Menu */}
      <div className="mt-8 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'active'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Active Team ({hiringManagers.length})
        </button>
        <button
          onClick={() => setActiveTab('invites')}
          className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'invites'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Pending Invites ({pendingInvitations.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2Icon className="h-8 w-8 animate-spin text-brand-600" />
            <p className="mt-2 text-sm text-slate-500">Loading team members...</p>
          </div>
        ) : activeTab === 'active' ? (
          // ── ACTIVE TEAM VIEW ───────────────────────────────────────
          hiringManagers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-base font-bold text-slate-900">No hiring managers registered</h3>
              <p className="mt-1 text-sm text-slate-500">
                Invite hiring managers to register using their work email address.
              </p>
              <Button variant="outline" className="mt-5" onClick={() => setInviteOpen(true)}>
                Send your first invite
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Manager</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {hiringManagers.map((manager) => (
                      <tr key={manager.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 font-bold text-brand-700">
                              {manager.firstName[0]}
                              {manager.lastName[0]}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {manager.firstName} {manager.lastName}
                              </p>
                              <p className="text-xs text-slate-500">{manager.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {manager.isActive ? (
                            <Badge tone="green">Active</Badge>
                          ) : (
                            <Badge tone="red">Deactivated</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(manager.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant={manager.isActive ? 'outline' : 'primary'}
                            size="sm"
                            disabled={isIdLoading(manager.id)}
                            onClick={() => handleToggleStatus(manager)}
                          >
                            {isIdLoading(manager.id) ? (
                              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                            ) : manager.isActive ? (
                              <>
                                <UserXIcon className="h-3.5 w-3.5" /> Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheckIcon className="h-3.5 w-3.5" /> Activate
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          // ── PENDING INVITATIONS VIEW ──────────────────────────────
          pendingInvitations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <MailIcon className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-base font-bold text-slate-900">No pending invitations</h3>
              <p className="mt-1 text-sm text-slate-500">
                All sent invitations have been accepted, expired, or revoked.
              </p>
              <Button variant="outline" className="mt-5" onClick={() => setInviteOpen(true)}>
                Invite new manager
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Sent At</th>
                      <th className="px-6 py-4">Expires At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pendingInvitations.map((invite) => (
                      <tr key={invite.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-950">
                          {invite.email}
                        </td>
                        <td className="px-6 py-4">
                          {invite.isExpired ? (
                            <Badge tone="red">Expired</Badge>
                          ) : (
                            <Badge tone="amber">Pending</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(invite.sentAt)}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(invite.expiresAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isIdLoading(invite.id) || invite.isExpired}
                              onClick={() => handleResendInvitation(invite)}
                              title="Resend Invitation Email"
                            >
                              {isIdLoading(invite.id) ? (
                                <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <RefreshCwIcon className="h-3.5 w-3.5" /> Resend
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={isIdLoading(invite.id)}
                              onClick={() => handleRevokeInvitation(invite)}
                              title="Revoke Invitation"
                            >
                              <Trash2Icon className="h-4.5 w-4.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* Invite Modal */}
      <InviteHiringManagerModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={fetchHiringManagers}
      />

      {/* Dynamic Toast Feedback Notification */}
      {feedback && (
        <div
          role="status"
          className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto"
        >
          <CheckCircle2Icon className="h-4.5 w-4.5 text-emerald-400" />
          {feedback}
        </div>
      )}
    </div>
  );
}
