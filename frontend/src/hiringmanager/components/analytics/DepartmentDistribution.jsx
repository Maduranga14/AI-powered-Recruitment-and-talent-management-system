import React from 'react';

export default function DepartmentDistribution({ departments }) {
  const total = departments.reduce((s, d) => s + d.percentage, 0);
  
  const radius = 50;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const slices = departments.map(d => {
    const startPercent = cumulativePercent;
    cumulativePercent += d.percentage;
    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = (cumulativePercent / 100) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = d.percentage > 50 ? 1 : 0;
    return { ...d, x1, y1, x2, y2, largeArc };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <h3 className="font-bold text-[15px] text-gray-900">Department Distribution</h3>
      <div className="flex items-center gap-6">
        {/* Donut */}
        <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
          {slices.map((s, i) => (
            <path
              key={i}
              d={`M ${s.x1} ${s.y1} A ${radius} ${radius} 0 ${s.largeArc} 1 ${s.x2} ${s.y2}`}
              fill="none"
              stroke={s.color}
              strokeWidth="22"
            />
          ))}
          <circle cx={cx} cy={cy} r="30" fill="white" />
          <text x={cx} y={cy - 5} textAnchor="middle" className="text-[11px] font-bold fill-gray-700" fontSize="12" fontWeight="bold">1.2k</text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="fill-gray-400" fontSize="9">TOTAL</text>
        </svg>

        
        <div className="flex flex-col gap-2 flex-1">
          {departments.map(d => (
            <div key={d.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[12.5px] text-gray-600">{d.label}</span>
              </div>
              <span className="text-[12.5px] font-semibold text-gray-800">{d.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
