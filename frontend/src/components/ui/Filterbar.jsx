export default function FilterBar({ search, onSearchChange, searchPlaceholder = "Filter...", children }) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap mb-5">
      <div className="flex items-center gap-2.5 bg-white border-[1.5px] border-gray-200 rounded-lg px-3.5 py-2 flex-1 max-w-[360px] text-gray-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none flex-1 text-[13.5px] text-gray-700 placeholder-gray-400"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}
