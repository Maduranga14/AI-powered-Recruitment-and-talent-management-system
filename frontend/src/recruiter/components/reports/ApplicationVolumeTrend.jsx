

const W = 700, H = 200, PAD_X = 48, PAD_Y = 20, BOTTOM = 28;

function normalize(arr) {
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    return arr.map(v => {
        const t = (v - min) / (max - min + 0.001);
        return PAD_Y + (1 - t) * (H - PAD_Y - BOTTOM);
    });
}

function buildSmoothPath(xs, ys) {
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
        const cpx = (xs[i] + xs[i - 1]) / 2;
        d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
    }
    return d;
}

export default function ApplicationVolumeTrend({ data }) {
    const { thisYear, lastYear, labels } = data;
    const n = labels.length;
    const xs = labels.map((_, i) => PAD_X + (i / (n - 1)) * (W - PAD_X * 2));
    const ysThis = normalize(thisYear);
    const ysLast = normalize(lastYear);

    const pathThis = buildSmoothPath(xs, ysThis);
    const pathLast = buildSmoothPath(xs, ysLast);

    
    const areaPath = `${pathThis} L ${xs[n - 1]} ${H - BOTTOM} L ${xs[0]} ${H - BOTTOM} Z`;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-bold text-gray-900">Application Volume Trend</h2>
                <div className="flex items-center gap-4 text-[12px]">
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" />
                        This Year
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                        Last Year
                    </span>
                </div>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
                
                {[0.25, 0.5, 0.75, 1].map(t => {
                    const y = PAD_Y + (1 - t) * (H - PAD_Y - BOTTOM);
                    return (
                        <line key={t} x1={PAD_X} y1={y} x2={W - PAD_X} y2={y}
                            stroke="#f1f5f9" strokeWidth="1" />
                    );
                })}

                
                <path d={areaPath} fill="rgba(20,184,166,0.12)" />

                
                <path d={pathThis} fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                
                <path d={pathLast} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4"
                    strokeLinecap="round" strokeLinejoin="round" />

                
                {labels.map((label, i) => (
                    <text key={label} x={xs[i]} y={H - 4} textAnchor="middle"
                        fontSize="11" fill="#94a3b8" fontWeight="500">
                        {label}
                    </text>
                ))}

                
                {xs.map((x, i) => (
                    <circle key={i} cx={x} cy={ysThis[i]} r="3.5" fill="#14b8a6" stroke="white" strokeWidth="1.5" />
                ))}
            </svg>
        </div>
    );
}
