export default function AITopMatches({ matches, onViewAll }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-1.5 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                </svg>
                <h2 className="text-[13.5px] font-bold text-gray-900">AI Top Matches</h2>
            </div>

            <div className="flex flex-col gap-3">
                {matches.map(m => (
                    <button
                        key={m.id}
                        className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors group"
                    >
                        <div
                            className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                            style={{ backgroundColor: m.color }}
                        >
                            {m.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-gray-900 truncate">{m.name}</div>
                            <div className="text-[11.5px] text-gray-500 truncate">{m.role}</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="shrink-0 group-hover:stroke-blue-500 transition-colors">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                ))}
            </div>

            <button
                onClick={onViewAll}
                className="mt-4 text-[12.5px] text-blue-600 font-medium hover:underline w-full text-left"
            >
                View all matches →
            </button>
        </div>
    );
}
