import { useState } from 'react';

const typeColors = {
    'Technical Deep-dive': { bg: '#f1f5f9', color: '#475569' },
    'Final Panel':         { bg: '#ede9fe', color: '#6d28d9' },
    'System Design':       { bg: '#dbeafe', color: '#1d4ed8' },
    'Culture Fit':         { bg: '#dcfce7', color: '#15803d' },
    'Technical Screen':    { bg: '#fef3c7', color: '#92400e' },
    'HR Screen':           { bg: '#fce7f3', color: '#be185d' },
    'Portfolio Review':    { bg: '#ccfbf1', color: '#0f766e' },
};

function InterviewTypeBadge({ type }) {
    const s = typeColors[type] || { bg: '#f1f5f9', color: '#475569' };
    return (
        <span
            className="inline-block px-2.5 py-1 rounded-lg text-[11.5px] font-semibold leading-tight text-center"
            style={{ backgroundColor: s.bg, color: s.color }}
        >
            {type}
        </span>
    );
}

function StatusDot({ status }) {
    const confirmed = status === 'Confirmed';
    return (
        <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${confirmed ? 'text-teal-600' : 'text-gray-500'}`}>
            <span className={`w-2 h-2 rounded-full ${confirmed ? 'bg-teal-500' : 'bg-gray-400'}`} />
            {status}
        </span>
    );
}

function InterviewerAvatars({ colors, extra }) {
    return (
        <div className="flex items-center">
            {colors.map((c, i) => (
                <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white"
                    style={{ backgroundColor: c, marginLeft: i > 0 ? '-6px' : '0' }}
                />
            ))}
            {extra > 0 && (
                <div
                    className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center"
                    style={{ marginLeft: '-6px' }}
                >
                    +{extra}
                </div>
            )}
        </div>
    );
}

export default function InterviewsTable({ interviews }) {
    const [page, setPage] = useState(1);
    const PER_PAGE = 8;
    const totalPages = Math.max(1, Math.ceil(interviews.length / PER_PAGE));
    const shown = interviews.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Candidate</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Interviewers</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Date & Time</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {shown.map(iv => (
                        <tr key={iv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4">
                                <div className="text-[13px] font-semibold text-gray-900">{iv.name}</div>
                                <div className="text-[11.5px] text-gray-400">{iv.email}</div>
                            </td>
                            <td className="px-5 py-4">
                                <div className="text-[13px] font-medium text-gray-800">{iv.role}</div>
                                <div className="text-[11.5px] text-gray-400">{iv.dept}</div>
                            </td>
                            <td className="px-5 py-4">
                                <InterviewerAvatars colors={iv.interviewerColors} extra={iv.extraInterviewers} />
                            </td>
                            <td className="px-5 py-4">
                                <div className="text-[12.5px] font-medium text-gray-800">{iv.date}</div>
                                <div className="text-[11.5px] text-gray-500">{iv.time}</div>
                            </td>
                            <td className="px-5 py-4">
                                <InterviewTypeBadge type={iv.type} />
                            </td>
                            <td className="px-5 py-4">
                                <StatusDot status={iv.status} />
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                    {iv.actionType === 'join' && (
                                        <button className="bg-teal-500 hover:bg-teal-600 text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors">
                                            Join
                                        </button>
                                    )}
                                    {iv.actionType === 'resend' && (
                                        <button className="border border-gray-300 hover:border-gray-400 text-gray-700 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors">
                                            Resend Invite
                                        </button>
                                    )}
                                    {iv.actionType === 'details' && (
                                        <button className="border border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 text-[12px] font-medium px-3.5 py-1.5 rounded-lg transition-colors">
                                            Details
                                        </button>
                                    )}
                                    <button className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex items-center justify-between px-5 py-3 text-sm text-gray-500 border-t border-gray-100">
                <span>Showing 1-{shown.length} of {interviews.length} interviews</span>
                <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100" onClick={() => setPage(Math.max(1, page - 1))}>‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} onClick={() => setPage(n)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center ${page === n ? 'bg-teal-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                            {n}
                        </button>
                    ))}
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100" onClick={() => setPage(Math.min(totalPages, page + 1))}>›</button>
                </div>
            </div>
        </div>
    );
}
