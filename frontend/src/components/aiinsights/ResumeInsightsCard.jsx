import { resumeInsights } from "../../data/aiInsightsData";

export default function ResumeInsightsCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4">Resume Insights</h3>
            {resumeInsights.map((r, i) => (
                <div key={i} className="flex gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base shrink-0">{r.icon}</div>
                    <div>
                        <div className="font-semibold text-[13.5px] mb-0.5">{r.title}</div>
                        <div className="text-[12.5px] text-gray-600 leading-relaxed">{r.desc}</div>
                    </div>
                </div>
            ))}
            <button className="w-full border-[1.5px] border-gray-200 hover:bg-gray-100 rounded-lg py-2.5 text-sm font-semibold text-gray-700 mt-2 transition-colors">Re-scan Resume</button>
        </div>
    );
}
