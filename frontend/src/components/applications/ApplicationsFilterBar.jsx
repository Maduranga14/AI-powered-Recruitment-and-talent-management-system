import FilterBar from "../ui/Filterbar";

const STATUS_OPTIONS = ["All Statuses", "Applied", "Interviewing", "Offer", "Rejected"];

export default function ApplicationsFilterBar({ search, onSearchChange, statusFilter, onStatusChange }) {
  return (
    <FilterBar search={search} onSearchChange={onSearchChange} searchPlaceholder="Filter by company...">
      {STATUS_OPTIONS.map(s => (
        <button key={s} onClick={() => onStatusChange(s)}
          className={`border-[1.5px] rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${statusFilter === s ? "border-blue-600 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-700 bg-white hover:border-gray-400"}`}>
          {s} ∨
        </button>
      ))}
      <button className="border-[1.5px] border-gray-200 rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 transition-all">Any Date Range ∨</button>
      <button className="border-[1.5px] border-gray-200 rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 transition-all">Job Type ∨</button>
      <button className="border-[1.5px] border-gray-200 rounded-lg p-2 bg-white text-gray-600 flex items-center hover:border-gray-400 transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round"/>
        </svg>
      </button>
    </FilterBar>
  );
}