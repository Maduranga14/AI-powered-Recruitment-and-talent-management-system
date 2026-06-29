export default function StatusBadge({ label, color, background }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ color, background }}>
      {label}
    </span>
  );
}
