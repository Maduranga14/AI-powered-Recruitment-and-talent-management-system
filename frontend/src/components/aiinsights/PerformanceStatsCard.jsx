import { performanceStats, trendingSkills } from "../../data/aiInsightsData";

export default function PerformanceStatsCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-1">Performance Stats</h3>
            {performanceStats.map((p, i) => (
                <div key={i} className="flex items-center gap-3.5 py-3.5 border-b border-gray-100 last:border-0">
                    <span className="text-lg">{p.icon}</span>
                    <div className="flex-1">
                        <div className="text-sm text-gray-700 font-medium">{p.label}</div>
                        <div className="text-xs text-gray-500">{p.sub}</div>
                    </div>
                    <span className="text-xl font-extrabold text-gray-900">{p.value}</span>
                </div>
            ))}
            <div className="mt-5 bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-bold mb-3">Trending in Fintech</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                    {trendingSkills.map(t => (
                        <span key={t} className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-gray-700">{t} ↗</span>
                    ))}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">Update your profile with 2 of these to rank higher.</p>
            </div>
        </div>
    );
}
