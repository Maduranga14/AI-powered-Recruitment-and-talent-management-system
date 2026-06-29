import MatchBadge from "../ui/MatchBadge";

export default function JobCard({ job, liked, onToggleLike }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow" style={{ borderLeft: `4px solid ${job.borderColor}` }}>
            <div className="flex gap-3.5 mb-3.5">
                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-extrabold text-lg shrink-0">{job.company[0]}</div>
                <div className="flex-1">
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1">{job.title}</h3>
                    <div className="text-sm text-gray-500 mb-2">{job.company} • {job.location}</div>
                    <div className="flex gap-4 text-[12.5px] text-gray-500">
                        <span>💰 {job.salary}</span>
                        <span>🕐 {job.type}</span>
                        <span>📋 {job.exp}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <MatchBadge match={job.match} color={job.matchColor} size="lg" />
                    <button onClick={() => onToggleLike(job.id)} className="text-xl p-0.5">
                        {liked ? <span className="text-red-500">❤</span> : <span>🤍</span>}
                    </button>
                </div>
            </div>
            <div className="flex gap-2.5 justify-end">
                <button className="border-[1.5px] border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">View Details</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Apply Now</button>
            </div>
        </div>
    );
}
