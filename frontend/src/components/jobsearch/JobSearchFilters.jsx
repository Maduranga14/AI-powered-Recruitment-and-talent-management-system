const FILTERS = ["Location", "Job Type", "Salary Range", "Experience"];

export default function JobSearchFilters({ resultCount }) {
    return (
        <div className="flex items-center gap-2.5 flex-wrap mb-5">
            {FILTERS.map(f => (
                <button key={f} className="border-[1.5px] border-gray-200 rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 transition-all">{f} ∨</button>
            ))}
            <span className="text-sm text-gray-500 ml-1">Showing {resultCount} results</span>
        </div>
    );
}
