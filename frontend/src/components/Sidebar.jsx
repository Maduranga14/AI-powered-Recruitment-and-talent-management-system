const navItems = [
    {
        id: "dashboard", label: "Dashboard",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
    },
    {
        id: "applications", label: "My Applications",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
    },
    {
        id: "jobsearch", label: "Job Search",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
    },
    {
        id: "interviews", label: "Interviews",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    },
    {
        id: "aiinsights", label: "AI Insights",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    },
    {
        id: "settings", label: "Settings",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    },
];

export default function Sidebar({ activePage, setActivePage }) {
    return (
        <aside className="w-[200px] bg-white border-r border-gray-200 fixed top-0 left-0 h-screen z-10 flex flex-col py-5">
            <div className="flex items-center gap-2.5 px-5 pb-6">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="1" y="1" width="7" height="7" rx="1" fill="#2563EB" />
                    <rect x="11" y="1" width="7" height="7" rx="1" fill="#2563EB" opacity="0.5" />
                    <rect x="1" y="11" width="7" height="7" rx="1" fill="#2563EB" opacity="0.5" />
                    <rect x="11" y="11" width="7" height="7" rx="1" fill="#2563EB" />
                </svg>
                <span className="font-bold text-sm text-gray-900">System name</span>
            </div>

            <nav className="flex flex-col gap-0.5 px-2.5">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium w-full text-left transition-all duration-150 relative
              ${activePage === item.id
                                ? "text-blue-600 bg-blue-50 after:absolute after:right-[-10px] after:top-1/2 after:-translate-y-1/2 after:w-[3px] after:h-[60%] after:bg-blue-600 after:rounded"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                    >
                        <span className="flex shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    )
}
