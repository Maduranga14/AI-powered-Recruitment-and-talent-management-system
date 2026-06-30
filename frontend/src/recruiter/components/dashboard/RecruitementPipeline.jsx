export default function RecruitmentPipeline({ pipeline, onViewReport }) {
    const maxCount = Math.max(...pipeline.map(s => s.count));

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-bold text-gray-900">Recruitment Pipeline</h2>
                <button
                    onClick={onViewReport}
                    className="text-[12.5px] text-blue-600 font-medium hover:underline"
                >
                    View detailed report
                </button>
            </div>

            {/* Funnel bars */}
            <div className="flex gap-2">
                {pipeline.map((stage, idx) => {
                    const pct = Math.round((stage.count / maxCount) * 100);
                    return (
                        <div key={stage.stage} className="flex-1 flex flex-col gap-2">
                            <div
                                className="rounded-md transition-all duration-500 hover:opacity-80"
                                style={{
                                    height: `${Math.max(40, pct)}px`,
                                    backgroundColor: stage.color,
                                    minHeight: '40px',
                                }}
                            />
                            <div>
                                <div className="text-[12px] text-gray-500">{stage.stage}</div>
                                <div className="text-[16px] font-bold text-gray-900">{stage.count}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
