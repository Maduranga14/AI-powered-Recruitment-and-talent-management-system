import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarClockIcon,
  PencilIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  Trash2Icon,
  XIcon,
  Loader2Icon,
  AlertTriangleIcon,
} from 'lucide-react';
import type { AdminPerson } from '../../data/admin';
import { ACCOUNT_TONES, ROLE_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { adminApi, type AdminOrganizationDto, type DepartmentDto } from '../../services/api';

interface AdminPersonDrawerProps {
  person: AdminPerson | null;
  onClose: () => void;
  onToggleStatus: (person: AdminPerson) => void;
  onDeleted?: (personId: string) => void;
  onUpdated?: (person: AdminPerson) => void;
}

type DrawerView = 'detail' | 'edit' | 'delete-confirm';

const ROLE_OPTIONS = [
  { label: 'Candidate', value: 'Candidate' },
  { label: 'Recruiter', value: 'Recruiter' },
  { label: 'Hiring Manager', value: 'HiringManager' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Suspended', value: 'Suspended' },
];

export function AdminPersonDrawer({
  person,
  onClose,
  onToggleStatus,
  onDeleted,
  onUpdated,
}: AdminPersonDrawerProps) {
  const [view, setView] = useState<DrawerView>('detail');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [orgId, setOrgId] = useState('');
  const [deptId, setDeptId] = useState('');

  const [organizations, setOrganizations] = useState<AdminOrganizationDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);

  // Reset to detail view whenever the person changes
  useEffect(() => {
    if (person) {
      setView('detail');
      setError('');
    }
  }, [person?.id]);

  // Populate edit form when entering edit view
  useEffect(() => {
    if (view === 'edit' && person) {
      const nameParts = person.name.split(' ');
      setFirstName(nameParts[0] ?? '');
      setLastName(nameParts.slice(1).join(' ') ?? '');
      setEmail(person.email);
      // Map display role back to API role value
      const roleMap: Record<string, string> = {
        Administrator: 'Admin',
        Recruiter: 'Recruiter',
        'Hiring manager': 'HiringManager',
        Candidate: 'Candidate',
      };
      setRole(roleMap[person.role] ?? person.role);
      setStatus(person.status === 'Suspended' ? 'Suspended' : 'Active');
      setOrgId('');
      setDeptId('');

      // Load orgs + depts, then pre-select by matching the person's current names
      Promise.all([
        adminApi.getOrganizations(),
        adminApi.getDepartments(),
      ]).then(([orgs, deptRes]) => {
        setOrganizations(orgs);
        setDepartments(deptRes.departments);

        const matchedOrg = orgs.find(
          (o) => o.name.toLowerCase() === person.organization?.toLowerCase()
        );
        if (matchedOrg) {
          setOrgId(matchedOrg.id);
          // Reload departments scoped to this org
          adminApi.getDepartments(matchedOrg.name).then((r) => {
            setDepartments(r.departments);
            const matchedDept = r.departments.find(
              (d) => d.name.toLowerCase() === person.department?.toLowerCase()
            );
            if (matchedDept) setDeptId(matchedDept.id);
          }).catch(() => {});
        } else {
          const matchedDept = deptRes.departments.find(
            (d) => d.name.toLowerCase() === person.department?.toLowerCase()
          );
          if (matchedDept) setDeptId(matchedDept.id);
        }
      }).catch(() => {});
    }
  }, [view]);

  useEffect(() => {
    if (orgId && view === 'edit') {
      const org = organizations.find((o) => o.id === orgId);
      if (org) {
        adminApi.getDepartments(org.name).then((r) => setDepartments(r.departments)).catch(() => {});
      }
    }
  }, [orgId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person) return;
    setLoading(true);
    setError('');
    try {
      const updated = await adminApi.updateUser(person.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
        status,
        // Send selected IDs; undefined means "keep existing" (backend ignores null for these fields)
        organizationId: orgId || undefined,
        departmentId: deptId || undefined,
      });

      const roleDisplayMap: Record<string, string> = {
        Admin: 'Administrator',
        Recruiter: 'Recruiter',
        HiringManager: 'Hiring manager',
        Candidate: 'Candidate',
      };

      const updatedPerson: AdminPerson = {
        ...person,
        name: updated.data.fullName,
        email: updated.data.email,
        role: (roleDisplayMap[updated.data.role] ?? updated.data.role) as AdminPerson['role'],
        status: (updated.data.isActive ? 'Active' : 'Suspended') as AdminPerson['status'],
        organization: updated.data.organizationName || person.organization,
        department: updated.data.departmentName || person.department,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(updated.data.fullName)}&background=4f46e5&color=fff&bold=true&size=96&format=png`,
      };

      onUpdated?.(updatedPerson);
      setView('detail');
    } catch (err: any) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!person) return;
    setLoading(true);
    setError('');
    try {
      await adminApi.deleteUser(person.id);
      onDeleted?.(person.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
      setView('detail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {person && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close account details"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.24 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="person-drawer-title"
            className="relative h-full w-full max-w-lg overflow-y-auto border-l border-slate-800 bg-slate-900 text-white shadow-2xl backdrop-blur-2xl"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 py-4 backdrop-blur-md text-white">
              <p className="text-sm font-bold text-white">
                {view === 'edit' ? 'Edit account' : view === 'delete-confirm' ? 'Delete account' : 'Account details'}
              </p>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </header>

            {/* ── Detail View ───────────────────────────────────────────────── */}
            {view === 'detail' && (
              <div className="p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <img src={person.avatar} alt="" className="h-16 w-16 rounded-2xl border border-slate-800 bg-slate-950 p-0.5 shadow-md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        id="person-drawer-title"
                        className="font-display text-2xl font-extrabold text-white"
                      >
                        {person.name}
                      </h2>
                      <Badge tone={ACCOUNT_TONES[person.status]}>{person.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{person.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={ROLE_TONES[person.role]}>{person.role}</Badge>
                      <Badge tone="slate" className="bg-slate-800 text-slate-200 border-slate-700">{person.organization}</Badge>
                      {person.department && person.department !== '—' && (
                        <Badge tone="blue" className="bg-brand-500/20 text-teal-300 border-brand-500/30">Dept: {person.department}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <Button
                    variant={person.status === 'Suspended' ? 'primary' : 'danger'}
                    onClick={() => onToggleStatus(person)}
                    className="flex items-center justify-center gap-1.5 font-bold"
                  >
                    {person.status === 'Suspended' ? (
                      <ShieldCheckIcon className="h-4 w-4" />
                    ) : (
                      <ShieldAlertIcon className="h-4 w-4" />
                    )}
                    {person.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setView('edit')}
                    className="flex items-center justify-center gap-1.5 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setView('delete-confirm')}
                    className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold"
                  >
                    <Trash2Icon className="h-4 w-4" />
                    Delete
                  </Button>
                </div>

                <section className="mt-7 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-white">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <CalendarClockIcon className="h-4 w-4 text-teal-400" /> Account timeline
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Joined</dt>
                      <dd className="font-semibold text-slate-200">{person.joined}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Last active</dt>
                      <dd className="font-semibold text-slate-200">{person.lastActive}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Workspace</dt>
                      <dd className="font-semibold text-slate-200">{person.organization}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            )}

            {/* ── Edit View ─────────────────────────────────────────────────── */}
            {view === 'edit' && (
              <div className="p-5 sm:p-7 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <img src={person.avatar} alt="" className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-950 p-0.5" />
                  <div>
                    <p className="font-bold text-white">{person.name}</p>
                    <p className="text-xs text-slate-400">{person.email}</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-200 font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">First Name</label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Last Name</label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">Email</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Role</label>
                      <select
                        value={role}
                        onChange={(e) => {
                          setRole(e.target.value);
                          if (e.target.value !== 'HiringManager') {
                            setOrgId('');
                            setDeptId('');
                          }
                        }}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                      >
                        {ROLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value} className="bg-slate-900 text-white">{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value} className="bg-slate-900 text-white">{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {role === 'HiringManager' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-white mb-1">
                          Organization <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <select
                          value={orgId}
                          onChange={(e) => setOrgId(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                        >
                          <option value="" className="bg-slate-900 text-white">-- Keep current --</option>
                          {organizations.map((o) => (
                            <option key={o.id} value={o.id} className="bg-slate-900 text-white">{o.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white mb-1">
                          Department <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <select
                          value={deptId}
                          onChange={(e) => setDeptId(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                        >
                          <option value="" className="bg-slate-900 text-white">-- Keep current --</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                              {d.name}{d.organizationName ? ` (${d.organizationName})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setView('detail')} disabled={loading} className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-500 text-white font-bold">
                      {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                      Save changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Delete Confirm View ───────────────────────────────────────── */}
            {view === 'delete-confirm' && (
              <div className="p-5 sm:p-7 text-white">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-950/60 p-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-900/50 border border-red-500/40">
                    <AlertTriangleIcon className="h-7 w-7 text-red-400" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold text-white">Delete account?</p>
                    <p className="mt-1 text-sm text-slate-300">
                      This will permanently delete <span className="font-bold text-white">{person.name}</span>'s
                      account and cannot be undone.
                    </p>
                  </div>
                  {error && (
                    <p className="rounded-xl border border-red-500/30 bg-red-950/80 px-3 py-2 text-xs text-red-200 w-full font-medium">
                      {error}
                    </p>
                  )}
                  <div className="flex w-full gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setView('detail')}
                      disabled={loading}
                      className="flex-1 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold"
                    >
                      {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                      Yes, delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

