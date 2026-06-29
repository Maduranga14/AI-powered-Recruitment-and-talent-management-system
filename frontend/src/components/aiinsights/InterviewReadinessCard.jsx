export default function InterviewReadinessCard({ score = 88 }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4">Interview Readiness</h3>
            <div className="flex justify-center my-4 relative">
                <div className="relative">
                    <svg viewBox="0 0 100 100" width="100" height="100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 40 * (score / 100)} ${2 * Math.PI * 40}`}
                            strokeLinecap="round" strokeDashoffset={2 * Math.PI * 40 * 0.25}
                            transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold">{score}</div>
                </div>
            </div>
            <div className="text-green-700 font-semibold text-sm mb-2">✅ Qualified for Senior Roles</div>
            <p className="text-sm text-gray-600 leading-relaxed">Strong communication scores. Consider practicing 'System Design' case studies to reach 95+.</p>
        </div>
    );
}
