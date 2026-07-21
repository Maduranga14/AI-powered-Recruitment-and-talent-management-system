import React, { useState, useEffect, useCallback } from 'react';
import {
  UsersIcon,
  AlertCircleIcon,
  Loader2Icon,
  SearchIcon,
} from 'lucide-react';
import {
  recruiterApi,
  type HiringManager,
} from '../../services/api';
import { Badge } from '../ui/Badge';

export function RecruiterHiringManagers() {
  const [hiringManagers, setHiringManagers] = useState<HiringManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHiringManagers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await recruiterApi.getHiringManagers();
      setHiringManagers(res.hiringManagers || []);
    } catch (err: any) {
      console.error('[HiringManagers] failed to load data:', err);
      setError(err?.message ?? 'Failed to load hiring manager directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHiringManagers();
  }, [fetchHiringManagers]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredManagers = hiringManagers.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(q);
    const emailMatch = m.email.toLowerCase().includes(q);
    const deptMatch = (m.departmentName || '').toLowerCase().includes(q);
    return nameMatch || emailMatch || deptMatch;
  });

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Hiring Managers Directory
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            View all hiring managers assigned to your organization and their designated departments.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      {hiringManagers.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search manager by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      )}

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
            <p className="mt-2 text-sm text-slate-500">Loading directory...</p>
          </div>
        ) : hiringManagers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-base font-bold text-slate-900">No hiring managers found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Hiring managers created by your platform administrator will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Manager</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredManagers.map((manager) => (
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
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {manager.departmentName || 'Global / Unassigned'}
                        </span>
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
                    </tr>
                  ))}
                  {filteredManagers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                        No hiring managers match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
