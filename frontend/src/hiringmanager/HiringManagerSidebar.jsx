import React from 'react';

const navItems = [
  {
    id: 'hm-dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'hm-reviews',
    label: 'Reviews',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'hm-interviews',
    label: 'Interviews',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'hm-analytics',
    label: 'Analytics',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    id: 'hm-aiinsights',
    label: 'AI Insights',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: 'hm-settings',
    label: 'Settings',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function HiringManagerSidebar({ activePage, setActivePage }) {
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
          <div className="text-[11px] text-gray-400 leading-tight">Hiring Manager</div>
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
            <div className="text-[11px] text-gray-400 truncate">Senior Product Designer</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
