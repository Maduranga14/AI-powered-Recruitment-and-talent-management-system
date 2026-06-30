import React, { useState } from 'react'

export default function RecruiterTopbar() {
    const [search, setSearch] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-7 gap-4 sticky top-0 z-9">

        <div className="flex items-center gap-2.5 bg-gray-100 rounded-full px-4 py-2 flex-1 max-w-[400px] text-gray-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
                type="text"
                placeholder="Search for jobs, companies, or tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-[13.5px] text-gray-700 placeholder-gray-400"
            />
        </div>

        <div className="flex items-center gap-4 ml-auto">

            <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-gray-500 flex p-1.5 hover:text-gray-800 transition-colors"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>


            <div className="w-px h-6 bg-gray-200" />


            <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-end">
                    <span className="font-semibold text-[13px] text-gray-900">Alex Thompson</span>
                    <span className="text-gray-500 text-[11.5px]">Senior Product Designer</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm">
                    AT
                </div>
            </div>
        </div>
    </header>
  );
}
