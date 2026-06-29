export default function ProfileMatchCard() {
    const stats = [
        { label: "Role Relevance", value: "High", color: null },
        { label: "Market Demand", value: "Rising", color: "#16a34a" },
        { label: "Comp. Edge", value: "Top 8%", color: null },
    ];
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-3">
                <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide">AI VERIFIED</span>
                <span className="text-3xl text-gray-200 absolute top-5 right-6">✦</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2.5">Profile Match Analysis</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
                Based on your current trajectory, you are a{" "}
                <span className="text-blue-600 font-bold">92% match</span> for Lead Product Design roles in Fintech.
                Your technical proficiency in design systems and user research exceeds 85% of applicants.
            </p>
            <div className="grid grid-cols-3 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3.5">
                        <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                        <div className="text-base font-bold" style={s.color ? { color: s.color } : {}}>{s.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
