import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon } from 'lucide-react';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
import { AdminAuditSettings } from '../components/admin/AdminAuditSettings';
import { AdminOrganizationDrawer } from '../components/admin/AdminOrganizationDrawer';
import { AdminOrganizations } from '../components/admin/AdminOrganizations';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminPeople } from '../components/admin/AdminPeople';
import { AdminPersonDrawer } from '../components/admin/AdminPersonDrawer';
import { AdminShell, type AdminView } from '../components/admin/AdminShell';
import { RecruiterDepartments } from '../components/recruiter/RecruiterDepartments';
import {
  type AdminPerson,
  type AdminOrganization,
  type AdminRole,
  type AccountStatus,
} from '../data/admin';
import { adminApi, publicApi } from '../services/api';

export function Admin() {
  const [view, setView] = useState<AdminView>('overview');
  const [people, setPeople] = useState<AdminPerson[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [publishedJobs, setPublishedJobs] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState<AdminPerson | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
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
        const mappedStatus: AccountStatus = u.isActive ? 'Active' : 'Suspended';
        return {
          id: u.id,
          name: u.fullName,
          email: u.email,
          role: mappedRole,
          status: mappedStatus,
          organization: u.organizationName || 'Independent',
          department: u.departmentName || '—',
          joined: new Date(u.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          }),
          lastActive: 'Recently',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=4f46e5&color=fff&bold=true&size=96&format=png`,
        };
      });

      setPeople(backendPeople);
      setOrganizations(liveOrgs as AdminOrganization[]);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => { refreshData(); }, [view]);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2800);
  };

  const togglePersonStatus = async (person: AdminPerson) => {
    try {
      await adminApi.toggleUserStatus(person.id);
      const nextStatus = person.status === 'Suspended' ? 'Active' : 'Suspended';
      setPeople((prev) => prev.map((p) => p.id === person.id ? { ...p, status: nextStatus } : p));
      showFeedback(`${person.name} is now ${nextStatus.toLowerCase()}`);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update user status.');
    }
  };

  const handlePersonUpdated = (updated: AdminPerson) => {
    setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPerson(updated);
    showFeedback(`${updated.name}'s account updated.`);
  };

  const handlePersonDeleted = (personId: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== personId));
    setSelectedPerson(null);
    showFeedback('Account deleted successfully.');
  };

  const selectedOrganization = organizations.find((o) => o.id === selectedOrganizationId) || null;

  return (
    <AdminShell activeView={view} moderationCount={0} onViewChange={setView}>
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
              onOrganizationSelect={(org) => setSelectedOrganizationId(org.id)}
              onRefresh={refreshData}
            />
          )}
          {view === 'departments' && <RecruiterDepartments />}
          {view === 'analytics' && <AdminAnalytics />}
          {view === 'audit-settings' && (
            <AdminAuditSettings />
          )}
        </motion.div>
      </AnimatePresence>

      <AdminPersonDrawer
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onToggleStatus={togglePersonStatus}
        onUpdated={handlePersonUpdated}
        onDeleted={handlePersonDeleted}
      />
      <AdminOrganizationDrawer
        organization={selectedOrganization}
        onClose={() => setSelectedOrganizationId(null)}
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
