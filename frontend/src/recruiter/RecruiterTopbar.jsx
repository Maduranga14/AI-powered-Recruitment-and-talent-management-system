import { useState } from 'react';

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function RecruiterTopbar({ user, onLogout }) {
    const [search, setSearch] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-7 gap-4 sticky top-0 z-40">

            <div className="flex items-center gap-2.5 bg-gray-100 rounded-full px-4 py-2 flex-1 max-w-[400px] text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    placeholder="Search jobs, candidates, applications..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-[13.5px] text-gray-700 placeholder-gray-400"
                />
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <button className="relative text-gray-500 flex p-1.5 hover:text-gray-800 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <div className="w-px h-6 bg-gray-200" />

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(v => !v)}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                    >
                        <div className="flex flex-col items-end">
                            <span className="font-semibold text-[13px] text-gray-900">{user?.fullName || 'Recruiter'}</span>
                            <span className="text-gray-500 text-[11.5px]">Recruiter</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm">
                            {getInitials(user?.fullName)}
                        </div>
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-12 z-50 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-[13px] font-semibold text-gray-900 truncate">{user?.fullName}</p>
                                    <p className="text-[11.5px] text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                    My Profile
                                </button>
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                    <button
                                        onClick={() => { setShowMenu(false); onLogout?.(); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors font-medium"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
