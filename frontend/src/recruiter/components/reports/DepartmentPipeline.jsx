export default function DepartmentPipeline({ pipeline, quarter = 'Q3' }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[14px] font-bold text-gray-900">Department Pipeline</h2>
                <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] text-gray-500 font-medium">Progress: {quarter}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {pipeline.map(dept => {
                    const pct = Math.round((dept.hired / dept.total) * 100);
                    return (
                        <div key={dept.dept}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[13px] font-medium text-gray-800">{dept.dept}</span>
                                <span className="text-[12.5px] text-gray-500">
                                    {dept.hired}/{dept.total} Hired
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${pct}%`,
                                        background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 70%, #475569 100%)',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
