import { useState } from "react";
import { weekData, weekLabels } from "../../data/dashboardData";

export default function ActivityChart() {
    const [period, setPeriod] = useState("Last 30 Days");
    const maxVal = Math.max(...weekData);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900">Application Activity</h3>
                <select value={period} onChange={e => setPeriod(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 bg-white outline-none">
                    <option>Last 30 Days</option>
                    <option>Last 60 Days</option>
                    <option>Last 90 Days</option>
                </select>
            </div>
            <div className="flex items-end gap-3 h-40 pt-4">
                {weekData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center h-full">
                        <div className="flex-1 w-full flex items-end">
                            <div
                                className={`w-full rounded-t-md min-h-2 transition-colors ${i === 3 ? "bg-blue-600" : "bg-gray-200 hover:bg-gray-300"}`}
                                style={{ height: `${(val / maxVal) * 100}%` }}
                            />
                        </div>
                        <span className="mt-2 text-[11px] text-gray-500">{weekLabels[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
