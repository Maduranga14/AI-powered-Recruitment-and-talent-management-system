// Icon helpers
function BriefcaseIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    );
}
function PeopleIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function CalendarIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}
function ClockIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
function BoltIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}
function TargetIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
}
function DocIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    );
}
function CheckIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
function AlarmIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M5 3 2 6" />
            <path d="m22 6-3-3" />
            <path d="M6.38 18.7 4 21" />
            <path d="M17.64 18.67 20 21" />
        </svg>
    );
}
function FeedbackIcon({ color }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

const iconMap = {
    briefcase: BriefcaseIcon,
    people: PeopleIcon,
    calendar: CalendarIcon,
    clock: ClockIcon,
    bolt: BoltIcon,
    target: TargetIcon,
    doc: DocIcon,
    check: CheckIcon,
    alarm: AlarmIcon,
    feedback: FeedbackIcon,
};

export default function RecruiterStatCard({
    label, value, trend, trendColor, subtitle, valueColor,
    iconType, iconBg, iconColor, progress,
}) {
    const IconComp = iconType ? iconMap[iconType] : null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
                <span className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">{label}</span>
                {IconComp && (
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
                        <IconComp color={iconColor} />
                    </div>
                )}
            </div>

            <div>
                <div
                    className="text-[2rem] font-bold leading-tight"
                    style={{ color: valueColor || '#0f172a' }}
                >
                    {value}
                </div>
                {progress !== undefined && (
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: '#06b6d4' }}
                        />
                    </div>
                )}
            </div>

            <div>
                {trend && (
                    <span className="text-[12px] font-medium" style={{ color: trendColor || '#64748b' }}>
                        {trend}
                    </span>
                )}
                {subtitle && (
                    <span className="text-[12px] text-gray-500">{subtitle}</span>
                )}
            </div>
        </div>
    );
}
