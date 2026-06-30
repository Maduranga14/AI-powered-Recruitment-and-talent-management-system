function ScoreBadge({ score }) {
    const bg = score >= 90 ? '#ccfbf1' : score >= 75 ? '#dbeafe' : '#f1f5f9';
    const color = score >= 90 ? '#0d9488' : score >= 75 ? '#2563EB' : '#64748b';
    return (
        <span
            className="text-[12px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: bg, color }}
        >
            {score}
        </span>
    );
}

export default function RecentApplicationsTable({ applications }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-[14px] font-bold text-gray-900">Recent Applications</h2>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Candidate</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Applied</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">AI Score</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map(app => (
                        <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: app.color }}
                                    >
                                        {app.initials}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-semibold text-gray-900">{app.name}</div>
                                        <div className="text-[11.5px] text-gray-400">{app.location}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-3.5 text-[13px] text-gray-700">{app.role}</td>
                            <td className="px-5 py-3.5 text-[12.5px] text-gray-500">{app.appliedAgo}</td>
                            <td className="px-5 py-3.5">
                                <ScoreBadge score={app.aiScore} />
                            </td>
                            <td className="px-5 py-3.5">
                                <button className="text-[12px] font-medium text-blue-600 hover:underline">
                                    Review
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
