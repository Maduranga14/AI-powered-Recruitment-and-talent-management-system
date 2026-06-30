export default function InterviewCard({ interview }) {
    const { company, initial, role, type, date, time, matchScore, isAvailable, availableIn } = interview;
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-extrabold text-lg shrink-0">{initial}</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                        <span className="font-bold text-[15px]">{company}</span>
                        {matchScore && <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">✦ {matchScore} Match Score</span>}
                    </div>
                    <div className="text-blue-600 font-bold text-[15px] mb-2">{role}</div>
                    <div className="flex gap-5 text-sm text-gray-500">
                        <span>🖥 {type}</span>
                        <span>📅 {date} • {time}</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2.5">
                {isAvailable ? (
                    <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                        Join Meeting
                    </button>
                ) : (
                    <button disabled className="bg-gray-100 text-gray-400 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                        Available in {availableIn}
                    </button>
                )}
                <button className="border-[1.5px] border-gray-200 hover:border-gray-400 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all">
                    {isAvailable ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>View Instructions</>
                    ) : (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>Prep Checklist</>
                    )}
                </button>
            </div>
        </div>
    );
}
