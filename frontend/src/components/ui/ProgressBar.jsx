export default function ProgressBar({ percent, color, stage }) {
  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <div className="h-[5px] bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
      </div>
      {stage && <span className="text-[11px] text-gray-500">{stage}</span>}
    </div>
  );
}
