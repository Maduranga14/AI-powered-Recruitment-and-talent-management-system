import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2Icon, 
  PlusIcon, 
  Trash2Icon, 
  UserIcon, 
  ShieldCheckIcon, 
  Loader2Icon, 
  XIcon 
} from 'lucide-react';
import { recruiterApi, type DepartmentDto, type DepartmentDashboardDto } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface RecruiterDepartmentsProps {
  organizationName?: string;
}

export function RecruiterDepartments({ organizationName }: RecruiterDepartmentsProps = {}) {
  const [dashboard, setDashboard] = useState<DepartmentDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptBadge, setNewDeptBadge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recruiterApi.getDepartments(organizationName);
      setDashboard(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load department dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [organizationName]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptHead.trim()) {
      setSubmitError('Department Name and Department Head are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const newDept = await recruiterApi.createDepartment({
        name: newDeptName.trim(),
        head: newDeptHead.trim(),
        badge: newDeptBadge.trim() || undefined,
        organizationName: organizationName,
      });

      setDashboard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          departments: [...prev.departments, newDept],
        };
      });

      setCreateOpen(false);
      setNewDeptName('');
      setNewDeptHead('');
      setNewDeptBadge('');
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await recruiterApi.deleteDepartment(id);
      setDashboard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          departments: prev.departments.filter((d) => d.id !== id),
        };
      });
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err?.message ?? 'Failed to delete department.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <Loader2Icon className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-slate-500">Loading department setup…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Building2Icon className="mx-auto h-12 w-12 text-red-300" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">Failed to load dashboard</h2>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Button variant="outline" className="mt-6" onClick={fetchDashboard}>
          Retry loading
        </Button>
      </div>
    );
  }

  const { corporateStructure, departments, globalPolicies } = dashboard!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={organizationName ? "" : "mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"}
    >
      {/* Page Header */}
      {!organizationName ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {corporateStructure.sub || 'Principal Entity'}
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
              {corporateStructure.name || 'Organization Structure'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage teams, departments, and policy scopes within your business unit.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto">
            <PlusIcon className="h-4 w-4 mr-1.5" /> Add Department
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900">
            Departments ({departments.length})
          </h3>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <PlusIcon className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      )}

      {/* Grid List */}
      <div className={organizationName ? "mt-4" : "mt-8"}>
        {!organizationName && (
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Departments ({departments.length})
          </h2>
        )}

        {departments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Building2Icon className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-900">No departments found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your organization's first team/department to assign job roles correctly.
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="mt-5">
              Create Department
            </Button>
          </div>
        ) : (
          <div className={organizationName ? "mt-4 space-y-3" : "mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
            {departments.map((dept) => {
              if (organizationName) {
                return (
                  <motion.div
                    key={dept.id}
                    layout
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 shadow-soft transition-all hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        style={{ backgroundColor: dept.headColor }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                      >
                        {dept.headInitials || 'HM'}
                      </span>
                      <div>
                        <span className="block text-sm font-bold text-slate-800 leading-tight">
                          {dept.name}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          Head: <span className="font-semibold">{dept.head}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {dept.badge && (
                        <span
                          style={{ backgroundColor: `${dept.badgeColor}15`, color: dept.badgeColor }}
                          className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        >
                          {dept.badge}
                        </span>
                      )}
                      <button
                        onClick={() => setDeleteConfirmId(dept.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 focus:opacity-100"
                        title="Delete Department"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={dept.id}
                  layout
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-bold text-slate-800 leading-tight">
                        {dept.name}
                      </h3>
                      <button
                        onClick={() => setDeleteConfirmId(dept.id)}
                        className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                        title="Delete Department"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>

                    {dept.badge && (
                      <div className="mt-2.5">
                        <span
                          style={{ backgroundColor: `${dept.badgeColor}15`, color: dept.badgeColor }}
                          className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
                        >
                          {dept.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <span
                      style={{ backgroundColor: dept.headColor }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                    >
                      {dept.headInitials || 'HM'}
                    </span>
                    <div>
                      <span className="block text-xs font-medium text-slate-400">Team Head</span>
                      <span className="block text-xs font-bold text-slate-700">{dept.head}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Policies Section */}
      {!organizationName && globalPolicies.length > 0 && (
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Corporate Governance Policies
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Active compliance rules. These configurations are managed globally by enterprise administrators.
          </p>

          <div className="mt-6 divide-y divide-slate-100">
            {globalPolicies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="pr-4">
                  <span className="font-bold text-slate-800 text-sm">{policy.label}</span>
                  <span className="block text-xs text-slate-500 mt-0.5 leading-normal">
                    {policy.desc}
                  </span>
                </div>
                <Badge tone={policy.enabled ? 'brand' : 'slate'}>
                  {policy.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            >
              <button
                onClick={() => setCreateOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <XIcon className="h-5 w-5" />
              </button>

              <h2 className="font-display text-xl font-extrabold text-slate-900">Create Team</h2>
              <p className="mt-1 text-xs text-slate-500">
                Establish a new department structure and assign responsibilities.
              </p>

              <form onSubmit={handleCreate} className="mt-6 space-y-4">
                <Input
                  label="Department Name"
                  placeholder="e.g. Sales & Marketing"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  disabled={submitting}
                  required
                />

                <Input
                  label="Department Head (Full Name)"
                  placeholder="e.g. Elena Rodriguez"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                  disabled={submitting}
                  required
                />

                <Input
                  label="Badge Tag (Optional)"
                  placeholder="e.g. HIGH VOLUME or GROWTH"
                  value={newDeptBadge}
                  onChange={(e) => setNewDeptBadge(e.target.value)}
                  disabled={submitting}
                />

                {submitError && (
                  <p className="text-xs font-semibold text-red-600 mt-2">{submitError}</p>
                )}

                <div className="mt-7 flex gap-3 pt-2">
                  <Button
                    fullWidth
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button fullWidth type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2Icon className="h-4 w-4 mr-1.5 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      'Create'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            >
              <h3 className="font-display text-lg font-extrabold text-slate-900">
                Delete department?
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-normal">
                This action is irreversible. All linked active job postings will lose their department classification assignment.
              </p>

              <div className="mt-6 flex gap-3">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deletingId !== null}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={deletingId !== null}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  {deletingId !== null ? (
                    <>
                      <Loader2Icon className="h-4 w-4 mr-1.5 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
