import StatusBadge from "../ui/StatusBadge";

export default function CompletedInterviewsTable({ interviews }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {["Company", "Role", "Date", "Status"].map(h => (
                            <th key={h} className="text-left text-[11px] font-semibold text-gray-500 tracking-wide px-4 py-3 border-b border-gray-200 bg-gray-50">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {interviews.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3.5 font-semibold text-sm">{item.company}</td>
                            <td className="px-4 py-3.5 text-sm text-gray-700">{item.role}</td>
                            <td className="px-4 py-3.5 text-sm text-gray-500">{item.date}</td>
                            <td className="px-4 py-3.5"><StatusBadge label={item.status} color={item.statusColor} background={item.statusBg} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
