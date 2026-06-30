export default function AIPrepKit({ context = "NexTech's tech stack" }) {
    return (
        <div className="bg-[#0f172a] text-white rounded-xl p-6">
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
                <span>✦</span>
                <h3 className="text-base font-bold text-white">AI Prep Kit</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
                Based on {context}, we recommend reviewing System Design patterns for distributed caching.
            </p>
            <button className="w-full bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg text-sm transition-colors">
                Generate Mock Interview
            </button>
        </div>
    );
}
