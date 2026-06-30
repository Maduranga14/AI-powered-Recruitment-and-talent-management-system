// Pure SVG conversion trends chart — two smooth bezier curves (Apps & Hires)
const W = 320, H = 120, PAD = 24;

// Data: 4 points across Days 1, 10, 20, Today
const appsData  = [72, 55, 38, 28];   // y-values (lower = higher on chart)
const hiresData = [98, 78, 62, 48];

function buildPath(data) {
    const xs = data.map((_, i) => PAD + (i / (data.length - 1)) * (W - PAD * 2));
    const ys = data.map(v => v);
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
        const cpx = (xs[i] + xs[i - 1]) / 2;
        d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
    }
    return { path: d, xs, ys };
}

const apps  = buildPath(appsData);
const hires = buildPath(hiresData);

const xlabels = ['Day 1', 'Day 10', 'Day 20', 'Today'];

export default function ConversionTrends() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-bold text-gray-900">Conversion Trends</h2>
                <div className="flex items-center gap-3 text-[11.5px] text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-0.5 rounded bg-slate-800" /> Apps
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-0.5 rounded bg-cyan-500" /> Hires
                    </span>
                </div>
            </div>

            <svg viewBox={`0 0 ${W} ${H + 20}`} width="100%" style={{ display: 'block' }}>
                {/* Grid lines */}
                {[40, 70, 100].map(y => (
                    <line key={y} x1={PAD} y1={y} x2={W - PAD} y2={y}
                        stroke="#f1f5f9" strokeWidth="1" />
                ))}

                {/* Apps line */}
                <path d={apps.path} fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Hires line */}
                <path d={hires.path} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* X-axis labels */}
                {xlabels.map((label, i) => {
                    const x = PAD + (i / (xlabels.length - 1)) * (W - PAD * 2);
                    return (
                        <text key={label} x={x} y={H + 18} textAnchor="middle"
                            fontSize="10" fill="#94a3b8">
                            {label}
                        </text>
                    );
                })}

                {/* Data point dots — apps */}
                {apps.xs.map((x, i) => (
                    <circle key={i} cx={x} cy={apps.ys[i]} r="3" fill="#0f172a" />
                ))}
                {/* Data point dots — hires */}
                {hires.xs.map((x, i) => (
                    <circle key={i} cx={x} cy={hires.ys[i]} r="3" fill="#06b6d4" />
                ))}
            </svg>
        </div>
    );
}
