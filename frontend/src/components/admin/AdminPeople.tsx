import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterIcon, SearchIcon, UserRoundXIcon, UserPlusIcon, XIcon, Loader2Icon } from 'lucide-react';
import type { AccountStatus, AdminPerson, AdminRole } from '../../data/admin';
import { ACCOUNT_TONES, ROLE_TONES } from '../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input, PasswordInput } from '../ui/Input';
import { adminApi, type AdminOrganizationDto, type DepartmentDto } from '../../services/api';

interface AdminPeopleProps {
  people: AdminPerson[];
  onPersonSelect: (person: AdminPerson) => void;
  onRefresh?: () => void;
}

export function AdminPeople({ people, onPersonSelect, onRefresh }: AdminPeopleProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All roles' | AdminRole>('All roles');
  const [statusFilter, setStatusFilter] = useState<'All statuses' | AccountStatus>('All statuses');

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Recruiter' | 'HiringManager'>('Recruiter');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [organizations, setOrganizations] = useState<AdminOrganizationDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      adminApi.getOrganizations().then(setOrganizations).catch(console.error);
      adminApi.getDepartments().then((res) => setDepartments(res.departments)).catch(console.error);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (selectedOrgId) {
      const org = organizations.find((o) => o.id === selectedOrgId);
      if (org) {
        adminApi.getDepartments(org.name).then((res) => {
          setDepartments(res.departments);
        }).catch(() => setDepartments([]));
      }
    } else if (isModalOpen) {
      adminApi.getDepartments().then((res) => {
        setDepartments(res.departments);
      }).catch(() => setDepartments([]));
    }
  }, [selectedOrgId, organizations, isModalOpen]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return people.filter(
      (person) =>
        (!normalized ||
          [person.name, person.email, person.organization, person.department, person.role]
            .join(' ')
            .toLowerCase()
            .includes(normalized)) &&
        (roleFilter === 'All roles' || person.role === roleFilter) &&
        (statusFilter === 'All statuses' || person.status === statusFilter)
    );
  }, [people, query, roleFilter, statusFilter]);

  const clearFilters = () => {
    setQuery('');
    setRoleFilter('All roles');
    setStatusFilter('All statuses');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminApi.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
        organizationId: selectedOrgId || undefined,
        departmentId: role === 'HiringManager' ? (selectedDeptId || undefined) : undefined,
      });

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setSelectedOrgId('');
      setSelectedDeptId('');
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create user account.');
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
          <p className="text-sm font-medium text-slate-500">Account governance</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            People
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Provision recruiter & hiring manager accounts and manage user access.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-500"
        >
          <UserPlusIcon className="h-4 w-4" />
          Add User Account
        </Button>
      </div>

      <section
        className="mt-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl text-white sm:p-5"
        aria-label="People filters"
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_210px_190px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, department, or organization"
              className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-400"
              aria-label="Search people"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by role</span>
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as 'All roles' | AdminRole)
              }
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            >
              <option className="bg-slate-900 text-white">All roles</option>
              <option className="bg-slate-900 text-white">Candidate</option>
              <option className="bg-slate-900 text-white">Recruiter</option>
              <option className="bg-slate-900 text-white">Hiring manager</option>
              <option className="bg-slate-900 text-white">Administrator</option>
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by account status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'All statuses' | AccountStatus
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            >
              <option className="bg-slate-900 text-white">All statuses</option>
              <option className="bg-slate-900 text-white">Active</option>
              <option className="bg-slate-900 text-white">Suspended</option>
              <option className="bg-slate-900 text-white">Invited</option>
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between text-white">
        <p className="text-sm text-slate-400">
          <strong className="text-white">{visible.length}</strong> people shown
        </p>
        <button
          onClick={clearFilters}
          className="text-sm font-bold text-teal-300 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Clear filters
        </button>
      </div>

      {visible.length ? (
        <section
          className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl text-white"
          aria-label="People list"
        >
          <div className="hidden grid-cols-[minmax(220px,1.2fr)_150px_130px_130px_110px_100px] gap-4 border-b border-slate-800 bg-slate-950/60 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Name</span>
            <span>Role</span>
            <span>Organization</span>
            <span>Department</span>
            <span>Status</span>
            <span>Joined</span>
          </div>
          <div className="divide-y divide-slate-800">
            {visible.map((person) => (
              <button
                key={person.id}
                onClick={() => onPersonSelect(person)}
                className="grid w-full grid-cols-1 items-center gap-3 px-5 py-4 text-left hover:bg-slate-800/60 transition-colors lg:grid-cols-[minmax(220px,1.2fr)_150px_130px_130px_110px_100px] lg:gap-4"
              >
                <div className="flex items-center gap-3">
                  <img src={person.avatar} alt="" className="h-10 w-10 flex-shrink-0 rounded-xl object-cover ring-1 ring-slate-700" />
                  <div className="min-w-0">
                    <p className="font-bold text-white">{person.name}</p>
                    <p className="truncate text-xs text-slate-400">{person.email}</p>
                  </div>
                </div>
                <div>
                  <Badge tone={ROLE_TONES[person.role]}>{person.role}</Badge>
                </div>
                <div className="text-xs font-semibold text-slate-300">{person.organization}</div>
                <div className="text-xs font-medium text-slate-400 truncate">{person.department || '—'}</div>
                <div>
                  <Badge tone={ACCOUNT_TONES[person.status]}>{person.status}</Badge>
                </div>
                <div className="text-xs text-slate-400">{person.joined}</div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-soft">
          <UserRoundXIcon className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No people found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search criteria or add a new user account.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            <UserPlusIcon className="mr-2 h-4 w-4" /> Add User Account
          </Button>
        </div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl backdrop-blur-2xl text-white z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-teal-300 border border-brand-500/30">
                    <UserPlusIcon className="h-5 w-5" />
                  </span>
                  <h2 className="font-display text-lg font-bold text-white">
                    Create User Account
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-200 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      First Name *
                    </label>
                    <Input
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Last Name *
                    </label>
                    <Input
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="jane.doe@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Password *
                  </label>
                  <PasswordInput
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Role *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => {
                        const newRole = e.target.value as any;
                        setRole(newRole);
                        if (newRole === 'Recruiter') setSelectedDeptId('');
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                    >
                      <option value="Recruiter" className="bg-slate-900 text-white">Recruiter</option>
                      <option value="HiringManager" className="bg-slate-900 text-white">Hiring Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Assign Organization <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <select
                      value={selectedOrgId}
                      onChange={(e) => setSelectedOrgId(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                    >
                      <option value="" className="bg-slate-900 text-white">-- Select Organization --</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id} className="bg-slate-900 text-white">
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {role === 'HiringManager' && (
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Assign Department <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                    >
                      <option value="" className="bg-slate-900 text-white">-- Select Department --</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                          {dept.name} {dept.organizationName ? `(${dept.organizationName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                    className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-500 text-white font-bold">
                    {loading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create User Account
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