export default function StatCard({ label, value, badge, badgeColor }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="text-xs font-semibold mb-2" style={{ color: badgeColor }}>{badge}</div>
            <div className="text-sm text-gray-500 mb-1.5">{label}</div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
    );
}
