const statusStyle = {
    ACTIVE:  { bg: '#dcfce7', color: '#16a34a' },
    URGENT:  { bg: '#fee2e2', color: '#dc2626' },
    PAUSED:  { bg: '#f1f5f9', color: '#64748b' },
};

export default function RecentJobPostings({ postings, onViewAll }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-bold text-gray-900">Recent Job Postings</h2>
                <button
                    onClick={onViewAll}
                    className="text-[12.5px] text-blue-600 font-medium hover:underline"
                >
                    View all
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {postings.map(job => {
                    const s = statusStyle[job.status] || statusStyle.PAUSED;
                    return (
                        <div
                            key={job.id}
                            className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold text-gray-900 truncate">{job.title}</div>
                                <div className="text-[11.5px] text-gray-400">{job.dept} • {job.location}</div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-3">
                                <span className="text-[11.5px] text-gray-400">{job.postedAgo}</span>
                                <span
                                    className="text-[10.5px] font-bold px-2 py-0.5 rounded"
                                    style={{ backgroundColor: s.bg, color: s.color }}
                                >
                                    {job.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
