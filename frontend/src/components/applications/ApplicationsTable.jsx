import StatusBadge from "../ui/StatusBadge";
import ProgressBar from "../ui/ProgressBar";
import Pagination from "../ui/Pagination";

export default function ApplicationsTable({ applications, page, onPageChange, totalItems }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    {["Company","Position","Date Applied","Status","Progress","Actions"].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-500 tracking-wide px-4 py-3 border-b border-gray-200 bg-gray-50">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {applications.map((app, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[15px] shrink-0"
                                style={{ background: app.initBg, color: app.initColor }}>{app.initial}</div>
                                <span className="font-medium text-sm">{app.company}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-700 max-w-[200px]">{app.position}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{app.date}</td>
                        <td className="px-4 py-3.5"><StatusBadge label={app.status} color={app.statusColor} background={app.statusBg} /></td>
                        <td className="px-4 py-3.5"><ProgressBar percent={app.progress} color={app.barColor} stage={app.stage} /></td>
                        <td className="px-4 py-3.5"><button className="text-blue-600 text-sm font-medium">View</button></td>
                    </tr>
                ))}
            </tbody>
      </table>
      <Pagination page={page} totalPages={3} onPageChange={onPageChange} showing={applications.lenght} totalItems={totalItems} />
    </div>
  )
}
