export default function Pagination({ page, totalPages, onPageChange, totalItems, showing }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 text-sm text-gray-500 border-t border-gray-100">
      <span>Showing {showing} of {totalItems} active applications</span>
      <div className="flex gap-1">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" onClick={() => onPageChange(Math.max(1, page - 1))}>‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onPageChange(n)}
            className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${page === n ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-700"}`}>
            {n}
          </button>
        ))}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" onClick={() => onPageChange(Math.min(totalPages, page + 1))}>›</button>
      </div>
    </div>
  );
}
