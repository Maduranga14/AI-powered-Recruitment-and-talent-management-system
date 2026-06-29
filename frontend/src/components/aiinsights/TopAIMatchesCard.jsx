import { topMatches } from "../../data/aiInsightsData";

export default function TopAIMatchesCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4">⊕ Top AI Matches</h3>
            {topMatches.map((job, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3 last:mb-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-bold text-sm">{job.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{job.company} • {job.location}</div>
                        </div>
                        <span className="bg-green-50 text-green-700 text-sm font-bold px-3 py-1.5 rounded-lg text-center leading-tight">
                            {job.match}%<br /><small className="text-xs font-medium">Match</small>
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2.5">{job.desc}</p>
                    <a href="#" className="text-blue-600 text-sm font-semibold">View Details →</a>
                </div>
            ))}
        </div>
    );
}
