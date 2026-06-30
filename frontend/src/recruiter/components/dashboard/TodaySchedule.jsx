export default function TodaySchedule({ schedule }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-[14px] font-bold text-gray-900 mb-4">Today's Schedule</h2>
            <div className="flex flex-col gap-4">
                {schedule.map((item, idx) => (
                    <div key={item.id} className="flex gap-3">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${item.hasJoin ? 'bg-blue-500' : 'bg-gray-300'}`} />
                            {idx < schedule.length - 1 && (
                                <div className="w-px flex-1 bg-gray-100 my-1.5" />
                            )}
                        </div>
                        <div className="flex-1 pb-1">
                            <div className="text-[12px] text-gray-400 font-medium mb-0.5">{item.time}</div>
                            <div className="text-[13px] font-semibold text-gray-900">{item.name}</div>
                            <div className="text-[12px] text-gray-500 mb-2">{item.role}</div>
                            {item.hasJoin && (
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold py-2 rounded-lg transition-colors">
                                    Join Meeting
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
