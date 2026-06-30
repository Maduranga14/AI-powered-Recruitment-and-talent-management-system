const navItems = [
    {
        id: 'r-dashboard', label: 'Dashboard',
        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    },
    {
        id: 'r-jobmanagement', label: 'Job Management',
        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" /></svg>,
    },
    {
        id: 'r-applications', label: 'Applications',
        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    },
    {
        id: 'r-candidatesearch', label: 'Candidate Search',
        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><circle cx="11" cy="8" r="3" /></svg>,
    },
    {
        id: 'r-interviewmanagement', label: 'Interview Management',
        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></svg>,
    },
    {
        id: 'r-reports', label: 'Reports & Analytics',
        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>,
    },
];

export default function RecruiterSidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-[220px] bg-white border-r border-gray-200 fixed top-0 left-0 h-screen z-10 flex flex-col">

        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="1" width="7" height="7" rx="1" fill="#2563EB" />
                <rect x="11" y="1" width="7" height="7" rx="1" fill="#2563EB" opacity="0.45" />
                <rect x="1" y="11" width="7" height="7" rx="1" fill="#2563EB" opacity="0.45" />
                <rect x="11" y="11" width="7" height="7" rx="1" fill="#2563EB" />
            </svg>
            <div>
                <div className="font-bold text-[14.5px] text-gray-900 leading-tight">TalentAI</div>
                <div className="text-[11px] text-gray-400 leading-tight">Recruiter Portal</div>
            </div>
        </div>


        <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1 overflow-y-auto">
           {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium w-full text-left transition-all duration-150 border-l-[3px]
                        ${activePage === item.id
                            ? 'text-blue-600 bg-blue-50 border-blue-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-transparent'
                        }`}
                >
                    <span className="flex shrink-0">{item.icon}</span>
                    <span className="leading-tight">{item.label}</span>
                </button>
            ))} 
        </nav>


        <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    AT
                </div>
                <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-800 truncate">Alex Thompson</div>
                    <div className="text-[11px] text-gray-400 truncate">Senior Recruiter</div>
                </div>
            </div>
        </div>
    </aside>
  );
}
