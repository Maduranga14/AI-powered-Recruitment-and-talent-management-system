import { recentApplications } from "../../data/dashboardData";

export default function ApplicationStatusTable() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between p-6 pb-4">
                <h3 className="text-base font-bold text-gray-900">Application Status</h3>
                <button className="text-blue-600 text-sm font-semibold">Export List</button>
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {["COMPANY", "ROLE", "DATE APPLIED", "PROGRESS", "ACTION"].map(h => (
                            <th key={h} className="text-left text-[11px] font-semibold text-gray-500 tracking-wide px-6 py-2.5 border-b border-gray-200 bg-gray-50">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {recentApplications.map((app, i) => (
                        <tr key={i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                            <td className="px-6 py-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-sm">{app.initial}</div>
                                    <span className="text-sm">{app.company}</span>
                                </div>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700">{app.role}</td>
                            <td className="px-6 py-3 text-sm text-gray-500">{app.date}</td>
                            <td className="px-6 py-3">
                                <div className="min-w-[140px]">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>{app.stage}</span><span>{app.pct}%</span>
                                    </div>
                                    <div className="h-[5px] bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${app.pct}%`, background: app.color }} />
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-3">
                                <button className="text-lg text-gray-400 px-2">⋯</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
