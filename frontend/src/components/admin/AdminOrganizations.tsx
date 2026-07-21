import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2Icon, FilterIcon, SearchIcon, PlusIcon, Loader2Icon, XIcon, GlobeIcon, FileTextIcon, ShieldCheckIcon } from 'lucide-react';
import type { AdminOrganization, OrganizationStatus } from '../../data/admin';
import { ORGANIZATION_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { adminApi } from '../../services/api';

interface AdminOrganizationsProps {
  organizations: AdminOrganization[];
  onOrganizationSelect: (organization: AdminOrganization) => void;
  onRefresh?: () => void;
}

export function AdminOrganizations({
  organizations,
  onOrganizationSelect,
  onRefresh,
}: AdminOrganizationsProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All statuses' | OrganizationStatus>('All statuses');
  
  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [sub, setSub] = useState('');
  const [plan, setPlan] = useState<'Starter' | 'Growth' | 'Scale'>('Starter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return organizations.filter(
      (organization) =>
        (!normalized ||
          [organization.name, organization.owner, organization.plan]
            .join(' ')
            .toLowerCase()
            .includes(normalized)) &&
        (statusFilter === 'All statuses' || organization.status === statusFilter)
    );
  }, [organizations, query, statusFilter]);

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('All statuses');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Organization name is required.');
      return;
    }

    if (!taxNumber.trim()) {
      setError('Registration / Tax Number is required to verify real company status.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminApi.createOrganization({
        name: name.trim(),
        taxNumber: taxNumber.trim(),
        website: website.trim() || undefined,
        shortDescription: shortDescription.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        sub: sub.trim() || 'Verified Corporate Tenant',
        plan,
        status: 'Healthy',
      });

      setName('');
      setTaxNumber('');
      setWebsite('');
      setShortDescription('');
      setLogoUrl('');
      setSub('');
      setPlan('Starter');
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Workspace governance</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Organizations
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create verified corporate workspaces, set up company profiles, and assign recruiter teams.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-500"
        >
          <PlusIcon className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <section
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5"
        aria-label="Organization filters"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_210px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workspace or owner"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              aria-label="Search organizations"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by organization status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'All statuses' | OrganizationStatus
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option>All statuses</option>
              <option>Healthy</option>
              <option>Review</option>
              <option>Restricted</option>
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-900">{visible.length}</strong> organizations shown
        </p>
        <button
          onClick={clearFilters}
          className="text-sm font-semibold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Clear filters
        </button>
      </div>

      {visible.length ? (
        <section
          className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          aria-label="Organizations"
        >
          <div className="hidden grid-cols-[minmax(240px,1.4fr)_110px_120px_120px_130px_120px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Organization</span>
            <span>Plan</span>
            <span>Members</span>
            <span>Jobs</span>
            <span>Status</span>
            <span>Usage</span>
          </div>
          <div className="divide-y divide-slate-100">
            {visible.map((organization) => (
              <button
                key={organization.id}
                onClick={() => onOrganizationSelect(organization)}
                className="grid w-full grid-cols-1 items-center gap-3 px-5 py-4 text-left hover:bg-slate-50/75 lg:grid-cols-[minmax(240px,1.4fr)_110px_120px_120px_130px_120px] lg:gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 font-display text-sm font-extrabold text-brand-700">
                    {organization.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{organization.name}</p>
                    <p className="text-xs text-slate-500">{organization.sub}</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  <Badge tone="brand">{organization.plan}</Badge>
                </div>
                <div className="text-xs font-medium text-slate-600">
                  {organization.members} member{organization.members !== 1 ? 's' : ''}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  {organization.activeJobs} active
                </div>
                <div>
                  <Badge tone={ORGANIZATION_TONES[organization.status]}>
                    {organization.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">{organization.monthlyUsage}</div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-soft">
          <Building2Icon className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No organizations found</p>
          <p className="mt-1 text-sm text-slate-500">
            Create an organization to start assigning recruiters and departments.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            <PlusIcon className="mr-2 h-4 w-4" /> Create Organization
          </Button>
        </div>
      )}

      {/* Create Organization Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Building2Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      Create New Organization
                    </h2>
                    <p className="text-xs text-slate-500">Verify company tax details & setup tenant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization Name *
                  </label>
                  <Input
                    placeholder="e.g. Acme Corporation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration / Tax Number * <span className="text-slate-400 font-normal">(verifies real company)</span>
                  </label>
                  <Input
                    placeholder="e.g. TAX-987654321-US"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    icon={<ShieldCheckIcon className="h-4 w-4 text-slate-400" />}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Website URL <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      placeholder="https://acme.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      icon={<GlobeIcon className="h-4 w-4 text-slate-400" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tier Plan
                    </label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Growth">Growth</option>
                      <option value="Scale">Scale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Description <span className="text-slate-400 font-normal">(shown on job listings)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the organization and what it does..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Logo Image URL <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Organization
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}