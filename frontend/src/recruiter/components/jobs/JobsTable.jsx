import { useState } from 'react';
import Pagination from '../../../components/ui/Pagination';

const statusStyle = {
    Active:  { bg: '#dcfce7', color: '#16a34a', dot: '#16a34a' },
    Draft:   { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
    Closed:  { bg: '#fee2e2', color: '#dc2626', dot: '#dc2626' },
};

function JobStatusBadge({ status }) {
    const s = statusStyle[status] || statusStyle.Draft;
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
            style={{ backgroundColor: s.bg, color: s.color }}
        >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
            {status}
        </span>
    );
}

function AvatarStack({ colors, extraCount }) {
    const shown = colors.slice(0, 3);
    return (
        <div className="flex items-center">
            {shown.map((c, i) => (
                <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: c, marginLeft: i > 0 ? '-6px' : '0' }}
                />
            ))}
            {extraCount > 0 && (
                <div
                    className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center"
                    style={{ marginLeft: '-6px' }}
                >
                    +{extraCount}
                </div>
            )}
        </div>
    );
}

export default function JobsTable({ jobs, filter }) {
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const filtered = jobs.filter(j => {
        if (filter === 'All') return true;
        return j.status === filter;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Job Title & ID</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Department</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Date Posted</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Applications</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {shown.map(job => (
                        <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4">
                                <div className="text-[13px] font-bold text-gray-900">{job.title}</div>
                                <div className="text-[11.5px] text-gray-400">{job.jobId}</div>
                            </td>
                            <td className="px-5 py-4 text-[13px] text-gray-700">{job.department}</td>
                            <td className="px-5 py-4 text-[13px] text-gray-600">{job.datePosted}</td>
                            <td className="px-5 py-4">
                                <AvatarStack colors={job.avatarColors} extraCount={job.extraCount} />
                            </td>
                            <td className="px-5 py-4">
                                <JobStatusBadge status={job.status} />
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3 text-gray-400">
                                    {/* View */}
                                    <button className="hover:text-blue-600 transition-colors" title="View">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                    {/* Edit */}
                                    <button className="hover:text-blue-600 transition-colors" title="Edit">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    {/* Pause */}
                                    <button className="hover:text-amber-500 transition-colors" title="Pause">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" /><line x1="10" y1="15" x2="10" y2="9" /><line x1="14" y1="15" x2="14" y2="9" />
                                        </svg>
                                    </button>
                                    {/* Delete */}
                                    <button className="hover:text-red-500 transition-colors" title="Delete">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filtered.length}
                showing={`1-${shown.length} of ${filtered.length} jobs`}
            />
        </div>
    );
}
