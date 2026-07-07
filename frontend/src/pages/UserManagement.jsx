import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/api';
import AddUserModal from '../components/AddUserModal';

const ROLE_COLORS = {
    Admin: 'bg-blue-50 text-blue-700',
    Recruiter: 'bg-violet-50 text-violet-700',
    HiringManager: 'bg-teal-50 text-teal-700',
    Candidate: 'bg-amber-50 text-amber-700',
};

const ROLE_LABELS = {
    Admin: 'Admin',
    Recruiter: 'Recruiter',
    HiringManager: 'Hiring Manager',
    Candidate: 'Candidate',
};

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#4F46E5', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export default function UserManagement() {
    const [showModal, setShowModal] = useState(false);
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const pageSize = 10;
    const roles = ['', 'Admin', 'Recruiter', 'HiringManager', 'Candidate'];
    const roleDisplayNames = { '': 'All Roles', Admin: 'Admin', Recruiter: 'Recruiter', HiringManager: 'Hiring Manager', Candidate: 'Candidate' };

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = { page, pageSize };
            if (roleFilter) params.role = roleFilter;
            const res = await adminApi.getUsers(params);
            setUsers(res.items || []);
            setTotalCount(res.totalCount || 0);
            setTotalPages(res.totalPages || 1);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setIsLoading(false);
        }
    }, [page, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleAddUser = async (newUser) => {
        setShowModal(false);
        setSuccessMsg(`✓ ${ROLE_LABELS[newUser.role] || newUser.role} account created for ${newUser.fullName}`);
        setTimeout(() => setSuccessMsg(''), 5000);
        fetchUsers();
    };

    const handleToggleStatus = async (user) => {
        setTogglingId(user.id);
        try {
            const res = await adminApi.toggleUserStatus(user.id);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: res.isActive } : u));
        } catch (err) {
            console.error('Toggle failed:', err);
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">

            
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900">User Management</h1>
                    <p className="text-[13px] text-gray-500 mt-1">Control access, manage roles, and monitor recruiter activity across the portal.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                        Add User
                    </button>
                </div>
            </div>

          
            {successMsg && (
                <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[13px] font-medium">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {successMsg}
                </div>
            )}

            
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: totalCount, icon: 'users' },
                    { label: 'Recruiters', value: users.filter(u => u.role === 'Recruiter').length || '-', icon: 'briefcase' },
                    { label: 'Hiring Managers', value: users.filter(u => u.role === 'HiringManager').length || '-', icon: 'shield' },
                    { label: 'Active Accounts', value: users.filter(u => u.isActive).length, icon: 'check', badge: 'Live' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    {stat.icon === 'users' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                                    {stat.icon === 'briefcase' && <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>}
                                    {stat.icon === 'shield' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></>}
                                    {stat.icon === 'check' && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>}
                                </svg>
                            </div>
                            {stat.badge && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">{stat.badge}</span>
                            )}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-[12.5px] text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </div>

           
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
               
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-[15px] text-gray-900">User Directory</span>
                        <span className="bg-gray-100 text-gray-600 text-[11.5px] font-semibold px-2 py-0.5 rounded-full">
                            {totalCount} Total
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={roleFilter}
                            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                            className="text-[12.5px] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white outline-none cursor-pointer hover:border-gray-300"
                        >
                            {roles.map(r => (
                                <option key={r} value={r}>{roleDisplayNames[r]}</option>
                            ))}
                        </select>
                    </div>
                </div>

                
                {isLoading ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span className="text-[13px]">Loading users...</span>
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                        <p className="text-[13.5px] font-medium">No users found</p>
                        <button onClick={() => setShowModal(true)} className="text-[13px] text-blue-600 hover:underline">
                            Add the first user
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                <th className="text-left py-3 px-6">Name & Email</th>
                                <th className="text-left py-3 px-4">Role</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Created</th>
                                <th className="text-left py-3 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full text-white text-[10.5px] font-bold flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                                            >
                                                {getInitials(user.fullName)}
                                            </div>
                                            <div>
                                                <div className="text-[13.5px] font-semibold text-gray-800">{user.fullName}</div>
                                                <div className="text-[11.5px] text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`flex items-center gap-1.5 text-[12.5px] font-medium ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-[12.5px] text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <button className="text-[12px] text-blue-600 font-medium hover:underline">Edit</button>
                                            <span className="text-gray-200">|</span>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                disabled={togglingId === user.id || user.role === 'Admin'}
                                                className={`text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                                            >
                                                {togglingId === user.id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <span className="text-[12.5px] text-gray-500">
                            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount} users
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all ${page === n ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            
            {showModal && (
                <AddUserModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleAddUser}
                />
            )}
        </div>
    );
}
