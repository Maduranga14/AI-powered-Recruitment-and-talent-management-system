export default function MatchBadge({ match, color, size = "sm" }) {
    const style = { color, background: color + (size === "lg" ? "15" : "18") };
    return (
        <span
            className={`font-semibold rounded-full ${size === "lg" ? "text-[13px] px-3 py-1.5" : "text-xs px-2.5 py-1"}`}
            style={style}
        >
            ✦ {match}{typeof match === "number" ? "% Match" : " Match"}
        </span>
    );
}
