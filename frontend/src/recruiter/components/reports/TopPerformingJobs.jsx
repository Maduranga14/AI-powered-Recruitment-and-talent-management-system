function StatusBadge({ status }) {
    const active = status === 'ACTIVE';
    return (
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    );
}

export default function TopPerformingJobs({ jobs, onViewAll }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-bold text-gray-900">Top Performing Jobs</h2>
                <button onClick={onViewAll} className="text-[12.5px] text-blue-600 font-medium hover:underline">
                    View All
                </button>
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="pb-2 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Role Title</th>
                        <th className="pb-2 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Apps</th>
                        <th className="pb-2 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Match Quality</th>
                        <th className="pb-2 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map(job => (
                        <tr key={job.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-4">
                                <div className="text-[13px] font-semibold text-gray-900">{job.title}</div>
                                <div className="text-[11px] text-gray-400">{job.dept} • {job.location}</div>
                            </td>
                            <td className="py-3 pr-4 text-[13px] font-medium text-gray-700">{job.apps}</td>
                            <td className="py-3 pr-4">
                                <span className="flex items-center gap-1 text-[13px] font-bold text-teal-600">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="5" />
                                    </svg>
                                    {job.matchQuality}%
                                </span>
                            </td>
                            <td className="py-3">
                                <StatusBadge status={job.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
