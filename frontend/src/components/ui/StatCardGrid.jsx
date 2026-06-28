import StatCard from "./StatCard";

export default function StatCardGrid({ cards }) {
    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            {cards.map((card, i) => <StatCard key={i} {...card} />)}
        </div>
    );
}
