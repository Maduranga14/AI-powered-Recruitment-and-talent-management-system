import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2Icon,
  PlusIcon,
  Trash2Icon,
  UserIcon,
  ShieldCheckIcon,
  Loader2Icon,
  XIcon,
  SearchIcon,
  FilterIcon,
  MailIcon
} from 'lucide-react';
import { recruiterApi, adminApi, type DepartmentDto, type DepartmentDashboardDto, type AdminOrganizationDto } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { RecruiterJob } from '../../data/recruiter';

interface RecruiterDepartmentsProps {
  organizationName?: string;
  jobs?: RecruiterJob[];
}

export function RecruiterDepartments({ organizationName, jobs }: RecruiterDepartmentsProps = {}) {
  const [dashboard, setDashboard] = useState<DepartmentDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and Filters
  const [query, setQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('All');
  const [badgeFilter, setBadgeFilter] = useState('All');
  const [organizations, setOrganizations] = useState<AdminOrganizationDto[]>([]);

  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDescription, setNewDeptDescription] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptContactEmail, setNewDeptContactEmail] = useState('');
  const [newDeptBadge, setNewDeptBadge] = useState('');
  const [selectedOrgName, setSelectedOrgName] = useState(organizationName || '');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

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

  useEffect(() => {
    if (createOpen && !organizationName) {
      adminApi.getOrganizations().then(setOrganizations).catch(console.error);
    }
  }, [createOpen, organizationName]);

  const distinctOrgs = useMemo(() => {
    if (!dashboard?.departments) return [];
    const set = new Set<string>();
    dashboard.departments.forEach((d) => {
      if (d.organizationName) set.add(d.organizationName);
    });
    return Array.from(set);
  }, [dashboard]);

  const distinctBadges = useMemo(() => {
    if (!dashboard?.departments) return [];
    const set = new Set<string>();
    dashboard.departments.forEach((d) => {
      if (d.badge) set.add(d.badge);
    });
    return Array.from(set);
  }, [dashboard]);

  const filteredDepartments = useMemo(() => {
    if (!dashboard?.departments) return [];
    const nq = query.trim().toLowerCase();
    return dashboard.departments.filter((dept) => {
      const matchesSearch =
        !nq ||
        [dept.name, dept.head, dept.description, dept.badge, dept.organizationName]
          .join(' ')
          .toLowerCase()
          .includes(nq);

      const matchesOrg = orgFilter === 'All' || dept.organizationName === orgFilter;
      const matchesBadge = badgeFilter === 'All' || dept.badge === badgeFilter;

      return matchesSearch && matchesOrg && matchesBadge;
    });
  }, [dashboard, query, orgFilter, badgeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      setSubmitError('Department Name is required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const targetOrg = organizationName || selectedOrgName || undefined;
      const newDept = await recruiterApi.createDepartment({
        name: newDeptName.trim(),
        description: newDeptDescription.trim() || undefined,
        head: newDeptHead.trim() || undefined,
        contactEmail: newDeptContactEmail.trim() || undefined,
        badge: newDeptBadge.trim() || undefined,
        organizationName: targetOrg,
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
      setNewDeptDescription('');
      setNewDeptHead('');
      setNewDeptContactEmail('');
      setNewDeptBadge('');
      setSelectedOrgName(organizationName || '');
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

  const { corporateStructure, departments } = dashboard!;

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
              Platform Governance
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
              Departments
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage departments, organizational teams, and contacts across all client tenants.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto flex items-center gap-2">
            <PlusIcon className="h-4 w-4" /> Add Department
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

      {/* Global Admin Search & Filter Bar */}
      {!organizationName && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="grid gap-3 md:grid-cols-[1fr_210px_180px]">
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <SearchIcon className="h-5 w-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search department, head, description or organization..."
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="All">All Organizations</option>
              {distinctOrgs.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>

            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="All">All Badges</option>
              {distinctBadges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className={organizationName ? "mt-4" : "mt-6"}>
        {!organizationName && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500">
              <strong className="text-slate-900">{filteredDepartments.length}</strong> departments shown
            </p>
            {(query || orgFilter !== 'All' || badgeFilter !== 'All') && (
              <button
                onClick={() => {
                  setQuery('');
                  setOrgFilter('All');
                  setBadgeFilter('All');
                }}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {filteredDepartments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-soft">
            <Building2Icon className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-900">No departments found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a department to assign hiring manager responsibilities and job roles.
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="mt-5">
              Create Department
            </Button>
          </div>
        ) : organizationName ? (
          /* Compact list when inside Organization Drawer/Modal */
          <div className="space-y-3">
            {filteredDepartments.map((dept) => {
              const isSelected = selectedDeptId === dept.id;
              return (
                <motion.div
                  key={dept.id}
                  layout
                  onClick={() => setSelectedDeptId(isSelected ? null : dept.id)}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 shadow-soft transition-all cursor-pointer ${isSelected
                    ? 'border-brand-600 ring-2 ring-brand-100 bg-brand-50/5'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                    }`}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(dept.id);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 focus:opacity-100"
                      title="Delete Department"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* High-end Table view on Admin Departments Page */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="hidden grid-cols-[minmax(220px,1.5fr)_minmax(180px,1.2fr)_minmax(200px,1.3fr)_140px_60px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
              <span>Department</span>
              <span>Organization</span>
              <span>Head / Contact</span>
              <span>Badge / Tag</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="grid grid-cols-1 items-center gap-3 px-5 py-4 hover:bg-slate-50/75 lg:grid-cols-[minmax(220px,1.5fr)_minmax(180px,1.2fr)_minmax(200px,1.3fr)_140px_60px] lg:gap-4 transition-colors"
                >
                  {/* Department Name & Description */}
                  <div>
                    <p className="font-semibold text-slate-900">{dept.name}</p>
                    {dept.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{dept.description}</p>
                    )}
                  </div>

                  {/* Organization Tenant */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-lg">
                      <Building2Icon className="h-3.5 w-3.5" />
                      {dept.organizationName || 'Global / Unassigned'}
                    </span>
                  </div>

                  {/* Department Head & Email */}
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ backgroundColor: dept.headColor || '#2563EB' }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                    >
                      {dept.headInitials || 'HM'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{dept.head || 'Unassigned'}</p>
                      {dept.contactEmail && (
                        <p className="text-[11px] text-slate-500 truncate">{dept.contactEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Badge / Tag */}
                  <div>
                    {dept.badge ? (
                      <span
                        style={{ backgroundColor: `${dept.badgeColor}15`, color: dept.badgeColor }}
                        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
                      >
                        {dept.badge}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteConfirmId(dept.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete Department"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Department Modal */}
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

              <h2 className="font-display text-xl font-extrabold text-slate-900">Create Department</h2>
              <p className="mt-1 text-xs text-slate-500">
                Establish a new department structure and assign responsibilities.
              </p>

              <form onSubmit={handleCreate} className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {!organizationName && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization *
                    </label>
                    <select
                      value={selectedOrgName}
                      onChange={(e) => setSelectedOrgName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      required
                    >
                      <option value="">-- Select Organization --</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.name}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Name *
                  </label>
                  <Input
                    placeholder="e.g. Engineering, Sales, Finance, Human Resources"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief note on the department's function..."
                    value={newDeptDescription}
                    onChange={(e) => setNewDeptDescription(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department Head / Contact
                    </label>
                    <Input
                      placeholder="e.g. Elena Rodriguez"
                      value={newDeptHead}
                      onChange={(e) => setNewDeptHead(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Email <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="engineering@company.com"
                      value={newDeptContactEmail}
                      onChange={(e) => setNewDeptContactEmail(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

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
