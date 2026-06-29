import { topPicks } from "../../data/jobSearchData";

export default function TopPicksSidebar() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-gray-900">Top Picks</h3>
                <span className="text-cyan-500">✦✦</span>
            </div>
            {topPicks.map((pick, i) => (
                <div key={i} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                    <div>
                        <div className="font-semibold text-[13.5px] mb-0.5">{pick.title}</div>
                        <div className="text-xs text-gray-500 mb-1">{pick.company}</div>
                        <span className="text-xs font-semibold" style={{ color: pick.matchColor }}>{pick.match} Match</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 ml-2 shrink-0">{pick.salary}</div>
                </div>
            ))}
            <button className="w-full text-center text-blue-600 text-sm font-semibold mt-2">View All Recommendations</button>
        </div>
    );
}
