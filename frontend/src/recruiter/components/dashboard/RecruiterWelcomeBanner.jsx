export default function RecruiterWelcomeBanner() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 flex items-start justify-between shadow-xs">
            <div>
                <p className="text-[13px] text-gray-500 mb-0.5">Good afternoon, Sarah!</p>
                <p className="text-[14px] text-gray-700 max-w-[520px] leading-relaxed">
                    You have <span className="font-semibold text-gray-900">3 candidate reviews</span> pending and{' '}
                    <span className="font-semibold text-gray-900">8 interviews</span> scheduled for today. Your active
                    roles are seeing a <span className="font-semibold text-emerald-600">15% increase</span> in high‑quality matches.
                </p>
            </div>
            <button className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors shrink-0 ml-6 shadow-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                AI Insights Active
            </button>
        </div>
    );
}
