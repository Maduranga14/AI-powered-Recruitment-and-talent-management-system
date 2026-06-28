export default function WelcomeBanner({ onViewMatches, onUpdateProfile }) {
    return (
        <div className="bg-[#0f172a] rounded-xl p-9 flex items-center justify-between text-white mb-6">
            <div>
                <h1 className="text-3xl font-extrabold mb-2">Welcome back, Alex!</h1>
                <p className="text-white/70 text-sm max-w-[480px] mb-6">
                    Your AI-powered talent insights are ready. You have 3 new matching job roles since your last visit.
                </p>
                <div className="flex gap-3">
                    <button onClick={onViewMatches} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">View Matches →</button>
                    <button onClick={onUpdateProfile} className="border border-white/50 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">Update Profile</button>
                </div>
            </div>
            <div className="relative shrink-0">
                <svg viewBox="0 0 120 120" width="120" height="120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 50 * 0.85} ${2 * Math.PI * 50}`}
                        strokeLinecap="round" strokeDashoffset={2 * Math.PI * 50 * 0.25}
                        transform="rotate(-90 60 60)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[22px] font-extrabold">85%</span>
                    <span className="text-[9px] text-white/60 font-semibold tracking-wide text-center leading-tight">PROFILE STRENGTH</span>
                </div>
            </div>
        </div>
    );
}
