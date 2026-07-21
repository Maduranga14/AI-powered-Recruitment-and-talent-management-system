import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon } from 'lucide-react';
import { AdminAuditSettings } from '../components/admin/AdminAuditSettings';
import { AdminModeration } from '../components/admin/AdminModeration';
import { AdminModerationDrawer } from '../components/admin/AdminModerationDrawer';
import { AdminOrganizationDrawer } from '../components/admin/AdminOrganizationDrawer';
import { AdminOrganizations } from '../components/admin/AdminOrganizations';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminPeople } from '../components/admin/AdminPeople';
import { AdminPersonDrawer } from '../components/admin/AdminPersonDrawer';
import { AdminShell, type AdminView } from '../components/admin/AdminShell';
import { RecruiterDepartments } from '../components/recruiter/RecruiterDepartments';
import {
  ADMIN_AUDIT_EVENTS,
  ADMIN_MODERATION,
  type AdminPerson,
  type AdminOrganization,
  type ModerationItem,
  type AdminRole,
  type AccountStatus
} from '../data/admin';
import { adminApi, publicApi } from '../services/api';

export function Admin() {
  const [view, setView] = useState<AdminView>('overview');
  const [people, setPeople] = useState<AdminPerson[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [moderation, setModeration] = useState(ADMIN_MODERATION);
  const [publishedJobs, setPublishedJobs] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState<AdminPerson | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [selectedModeration, setSelectedModeration] = useState<ModerationItem | null>(null);
  const [settings, setSettings] = useState({
    reviewAlerts: true,
    strictSafeguards: true
  });
  const [feedback, setFeedback] = useState('');

  const refreshData = async () => {
    try {
      const [res, jobs, liveOrgs] = await Promise.all([
        adminApi.getUsers(undefined, 1, 100),
        publicApi.getPublishedJobs().catch(() => []),
        adminApi.getOrganizations().catch(() => []),
      ]);

      setPublishedJobs(jobs.length);

      const backendPeople: AdminPerson[] = res.items.map((u) => {
        let mappedRole: AdminRole = 'Candidate';
        if (u.role === 'Admin') mappedRole = 'Administrator';
        else if (u.role === 'Recruiter') mappedRole = 'Recruiter';
        else if (u.role === 'HiringManager') mappedRole = 'Hiring manager';

        let mappedStatus: AccountStatus = u.isActive ? 'Active' : 'Suspended';

        return {
          id: u.id,
          name: u.fullName,
          email: u.email,
          role: mappedRole,
          status: mappedStatus,
          organization: u.organizationName || 'Independent',
          department: u.departmentName || '—',
          joined: new Date(u.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          lastActive: 'Recently',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=4f46e5&color=fff&bold=true&size=96&format=png`
        };
      });

      setPeople(backendPeople);
      setOrganizations(liveOrgs as AdminOrganization[]);

    } catch (err) {
      console.error('Failed to load live admin data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [view]);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2800);
  };

  const togglePersonStatus = async (person: AdminPerson) => {
    try {
      await adminApi.toggleUserStatus(person.id);
      const nextStatus = person.status === 'Suspended' ? 'Active' : 'Suspended';
      setPeople((prev) =>
        prev.map((item) =>
          item.id === person.id ? { ...item, status: nextStatus } : item
        )
      );
      showFeedback(`${person.name} is now ${nextStatus.toLowerCase()}`);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update user status.');
    }
  };

  const toggleSetting = (key: 'reviewAlerts' | 'strictSafeguards') => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    showFeedback('Safeguard setting updated');
  };

  const decideModeration = (
    id: string,
    decision: 'Approved' | 'Restricted'
  ) => {
    setModeration((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: decision } : item
      )
    );
    showFeedback(
      `Item ${decision.toLowerCase()} and logged in platform audit`
    );
  };

  const selectedOrganization =
    organizations.find((o) => o.id === selectedOrganizationId) || null;

  return (
    <AdminShell
      activeView={view}
      moderationCount={moderation.filter((i) => i.status === 'Pending').length}
      onViewChange={setView}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
          {view === 'overview' && (
            <AdminOverview
              people={people}
              organizations={organizations}
              moderation={moderation}
              publishedJobs={publishedJobs}
              onViewChange={setView}
            />
          )}

          {view === 'people' && (
            <AdminPeople people={people} onPersonSelect={setSelectedPerson} onRefresh={refreshData} />
          )}

          {view === 'organizations' && (
            <AdminOrganizations
              organizations={organizations}
              onOrganizationSelect={(organization) =>
                setSelectedOrganizationId(organization.id)
              }
              onRefresh={refreshData}
            />
          )}

          {view === 'departments' && <RecruiterDepartments />}

          {view === 'moderation' && (
            <AdminModeration
              moderation={moderation}
              onItemSelect={setSelectedModeration}
            />
          )}

          {view === 'audit-settings' && (
            <AdminAuditSettings
              auditEvents={ADMIN_AUDIT_EVENTS}
              settings={settings}
              onToggle={toggleSetting}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AdminPersonDrawer
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onToggleStatus={togglePersonStatus}
      />

      <AdminOrganizationDrawer
        organization={selectedOrganization}
        onClose={() => setSelectedOrganizationId(null)}
      />

      <AdminModerationDrawer
        item={selectedModeration}
        onClose={() => setSelectedModeration(null)}
        onDecision={decideModeration}
      />

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            role="status"
            className="fixed bottom-20 left-4 right-4 z-[60] flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto"
          >
            <CheckCircle2Icon className="h-4 w-4 text-accent-400" />
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}