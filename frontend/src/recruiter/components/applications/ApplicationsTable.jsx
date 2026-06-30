import { useState } from 'react';
import Pagination from '../../../components/ui/Pagination';

const statusStyle = {
    NEW:         { bg: '#dbeafe', color: '#1d4ed8' },
    REVIEWED:    { bg: '#f1f5f9', color: '#475569' },
    SHORTLISTED: { bg: '#dcfce7', color: '#15803d' },
};

function AiMatchBadge({ score, recommended }) {
    if (recommended) {
        return (
            <div className="inline-flex flex-col items-center">
                <span className="bg-teal-500 text-white text-[12px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span>✦</span> {score}%
                </span>
                <span className="text-[9.5px] text-teal-600 font-bold mt-0.5 tracking-wide">AI RECOMMENDED</span>
            </div>
        );
    }
    return (
        <span className="bg-gray-100 text-gray-600 text-[13px] font-bold px-3 py-1 rounded-full">
            {score}%
        </span>
    );
}

function AppStatusBadge({ status }) {
    const s = statusStyle[status] || statusStyle.REVIEWED;
    return (
        <span
            className="px-3 py-1 rounded-full text-[11.5px] font-bold"
            style={{ backgroundColor: s.bg, color: s.color }}
        >
            {status}
        </span>
    );
}

export default function ApplicationsTable({ applications, filter }) {
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const filtered = applications.filter(a => {
        if (filter === 'All') return true;
        if (filter === 'New') return a.status === 'NEW';
        if (filter === 'Shortlisted') return a.status === 'SHORTLISTED';
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Candidate</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Applied Role</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">AI Match</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Applied Date</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {shown.map(app => (
                        <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: app.color }}
                                    >
                                        {app.initials}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-semibold text-gray-900">{app.name}</div>
                                        <div className="text-[11.5px] text-gray-400">{app.title}</div>
                                        <div className="text-[11px] text-gray-400">{app.location}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4">
                                <div className="text-[13px] font-medium text-gray-800">{app.role}</div>
                                <div className="text-[11.5px] text-gray-400">{app.dept}</div>
                            </td>
                            <td className="px-5 py-4">
                                <AiMatchBadge score={app.aiMatch} recommended={app.aiRecommended} />
                            </td>
                            <td className="px-5 py-4">
                                <div className="text-[13px] text-gray-700">{app.appliedDate}</div>
                                <div className="text-[11.5px] text-gray-400">{app.appliedAgo}</div>
                            </td>
                            <td className="px-5 py-4">
                                <AppStatusBadge status={app.status} />
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <button className="text-[12px] font-medium text-blue-600 hover:underline">View</button>
                                    <span className="text-gray-300">|</span>
                                    <button className="text-[12px] font-medium text-gray-500 hover:text-gray-800">Schedule</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex items-center justify-between px-5 py-3 text-sm text-gray-500 border-t border-gray-100">
                <span>Showing 1 to {shown.length} of {filtered.length} results</span>
                <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" onClick={() => setPage(Math.max(1, page - 1))}>‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} onClick={() => setPage(n)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${page === n ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                            {n}
                        </button>
                    ))}
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" onClick={() => setPage(Math.min(totalPages, page + 1))}>›</button>
                </div>
            </div>
        </div>
    );
}
