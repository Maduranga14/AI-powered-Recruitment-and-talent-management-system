import { skillGaps } from "../../data/aiInsightsData";

export default function SkillGapAnalysis() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900">Skill Gap Analysis</h3>
                <div className="flex items-center gap-3.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-900 inline-block" /> You</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" /> Required</span>
                </div>
            </div>
            {skillGaps.map((s, i) => (
                <div key={i} className="mb-4">
                    <div className="flex justify-between mb-1.5">
                        <span className="text-[13.5px] text-gray-700">{s.skill}</span>
                        <span className={`text-sm font-semibold ${s.gap ? "text-red-600" : "text-gray-700"}`}>{s.you}% vs {s.required}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-gray-300 rounded-full" style={{ width: `${s.required}%` }} />
                        <div className={`absolute top-0 left-0 h-full rounded-full z-10 ${s.gap ? "bg-red-500" : "bg-gray-900"}`} style={{ width: `${s.you}%` }} />
                    </div>
                </div>
            ))}
            <div className="mt-4 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700">
                💡 Take the <a href="#" className="text-blue-600 font-semibold">Advanced Data Viz</a> course to bridge your primary skill gap.
            </div>
        </div>
    );
}
