import { upcomingInterviews } from "../../data/dashboardData";

export default function UpcomingInterviews() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4">Upcoming Interviews</h3>
            {upcomingInterviews.map((iv, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3.5 mb-3">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <div className="font-semibold text-sm">{iv.title}</div>
                            <div className="text-xs text-gray-500 my-0.5">{iv.company} • {iv.location}</div>
                            <div className="text-xs text-gray-500">{iv.isLive ? `🕐 ${iv.time}` : `📅 ${iv.date}`}</div>
                        </div>
                        {iv.isLive && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">LIVE</span>}
                    </div>
                    {iv.isLive && (
                        <button className="mt-2.5 w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors">Join Meeting</button>
                    )}
                </div>
            ))}
            <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 text-sm font-medium block mt-2">View Full Calendar →</a>
        </div>
    );
}
