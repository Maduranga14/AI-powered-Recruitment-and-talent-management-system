import React, { useState } from 'react';
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
import {
  ADMIN_AUDIT_EVENTS,
  ADMIN_MODERATION,
  ADMIN_ORGANIZATIONS,
  ADMIN_PEOPLE,
  type AdminPerson,
  type ModerationItem } from
'../data/admin';
export function Admin() {
  const [view, setView] = useState<AdminView>('overview');
  const [people, setPeople] = useState(ADMIN_PEOPLE);
  const [moderation, setModeration] = useState(ADMIN_MODERATION);
  const [selectedPerson, setSelectedPerson] = useState<AdminPerson | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    string | null>(
    null);
  const [selectedModeration, setSelectedModeration] =
  useState<ModerationItem | null>(null);
  const [settings, setSettings] = useState({
    reviewAlerts: true,
    strictSafeguards: true
  });
  const [feedback, setFeedback] = useState('');
  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2800);
  };
  const togglePersonStatus = (person: AdminPerson) => {
    const nextStatus = person.status === 'Suspended' ? 'Active' : 'Suspended';
    setPeople((current) =>
    current.map((item) =>
    item.id === person.id ?
    {
      ...item,
      status: nextStatus
    } :
    item
    )
    );
    setSelectedPerson((current) =>
    current?.id === person.id ?
    {
      ...current,
      status: nextStatus
    } :
    current
    );
    showFeedback(
      `${person.name} ${nextStatus === 'Active' ? 'reactivated' : 'suspended'} locally.`
    );
  };
  const decideModeration = (
  item: ModerationItem,
  status: 'Approved' | 'Declined') =>
  {
    setModeration((current) =>
    current.map((entry) =>
    entry.id === item.id ?
    {
      ...entry,
      status
    } :
    entry
    )
    );
    setSelectedModeration((current) =>
    current?.id === item.id ?
    {
      ...current,
      status
    } :
    current
    );
    showFeedback(`${item.title} ${status.toLowerCase()} locally.`);
  };
  const toggleSetting = (setting: 'reviewAlerts' | 'strictSafeguards') => {
    setSettings((current) => ({
      ...current,
      [setting]: !current[setting]
    }));
    showFeedback(
      `${setting === 'reviewAlerts' ? 'Review queue alerts' : 'Strict session safeguards'} updated.`
    );
  };
  const selectedOrganization =
  ADMIN_ORGANIZATIONS.find((item) => item.id === selectedOrganizationId) ??
  null;
  const pendingCount = moderation.filter(
    (item) => item.status === 'Pending'
  ).length;
  return (
    <AdminShell
      activeView={view}
      moderationCount={pendingCount}
      onViewChange={setView}>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.16
          }}>
          
          {view === 'overview' &&
          <AdminOverview
            people={people}
            organizations={ADMIN_ORGANIZATIONS}
            moderation={moderation}
            onViewChange={setView} />

          }
          {view === 'people' &&
          <AdminPeople people={people} onPersonSelect={setSelectedPerson} />
          }
          {view === 'organizations' &&
          <AdminOrganizations
            organizations={ADMIN_ORGANIZATIONS}
            onOrganizationSelect={(organization) =>
            setSelectedOrganizationId(organization.id)
            } />

          }
          {view === 'moderation' &&
          <AdminModeration
            moderation={moderation}
            onItemSelect={setSelectedModeration} />

          }
          {view === 'audit-settings' &&
          <AdminAuditSettings
            auditEvents={ADMIN_AUDIT_EVENTS}
            settings={settings}
            onToggle={toggleSetting} />

          }
        </motion.div>
      </AnimatePresence>
      <AdminPersonDrawer
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onToggleStatus={togglePersonStatus} />
      
      <AdminOrganizationDrawer
        organization={selectedOrganization}
        onClose={() => setSelectedOrganizationId(null)} />
      
      <AdminModerationDrawer
        item={selectedModeration}
        onClose={() => setSelectedModeration(null)}
        onDecision={decideModeration} />
      
      <AnimatePresence>
        {feedback &&
        <motion.div
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: 12
          }}
          role="status"
          className="fixed bottom-20 left-4 right-4 z-[60] flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto">
          
            <CheckCircle2Icon className="h-4 w-4 text-accent-400" />
            {feedback}
          </motion.div>
        }
      </AnimatePresence>
    </AdminShell>);

}