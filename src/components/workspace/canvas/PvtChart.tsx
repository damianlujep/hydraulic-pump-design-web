const W = 560;
const H = 336;
const M_L = 52;
const M_R = 30;
const M_T = 20;
const M_B = 46;
const PW = W - M_L - M_R;
const PH = H - M_T - M_B;
const P_MAX = 3000;
const PB = 520;

const X = (p: number) => M_L + (p / P_MAX) * PW;
const Y = (v: number) => M_T + (1 - v) * PH;

const rs = (p: number) => (p < PB ? 0.06 + 0.94 * (p / PB) : 1);
const bo = (p: number) => (p < PB ? 0.42 + 0.58 * (p / PB) : 1 - 0.14 * ((p - PB) / (P_MAX - PB)));
const mu = (p: number) => (p < PB ? 1 - 0.72 * (p / PB) : 0.28 + 0.24 * ((p - PB) / (P_MAX - PB)));

function series(f: (p: number) => number) {
  const pts: string[] = [];
  for (let p = 0; p <= P_MAX; p += 50) pts.push(`${X(p)},${Y(f(p))}`);
  return pts.join(" ");
}

const P_TICKS = [0, 750, 1500, 2250, 3000];
const V_TICKS = [0, 0.25, 0.5, 0.75, 1];

export const PvtChart = () => {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <rect x={M_L} y={M_T} width={PW} height={PH} fill="var(--chart-plot)" stroke="var(--border)" />

      {P_TICKS.map((p) => (
        <g key={`p-${p}`}>
          <line x1={X(p)} y1={M_T} x2={X(p)} y2={M_T + PH} stroke="var(--grid)" strokeWidth={1} />
          <text x={X(p)} y={M_T + PH + 15} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {p}
          </text>
        </g>
      ))}

      {V_TICKS.map((v) => (
        <g key={`v-${v}`}>
          <line x1={M_L} y1={Y(v)} x2={M_L + PW} y2={Y(v)} stroke="var(--grid)" strokeWidth={1} />
          <text x={M_L - 8} y={Y(v) + 3} textAnchor="end" fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {v.toFixed(2)}
          </text>
        </g>
      ))}

      <line x1={X(PB)} y1={M_T} x2={X(PB)} y2={M_T + PH} stroke="var(--data-orange)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
      <text x={X(PB) + 6} y={M_T + 12} fontSize={11} fontWeight={600} fill="var(--data-orange)" fontFamily="IBM Plex Mono">
        Pb
      </text>

      <polyline points={series(bo)} fill="none" stroke="var(--data-blue)" strokeWidth={2.4} strokeLinejoin="round" />
      <polyline points={series(rs)} fill="none" stroke="var(--data-orange)" strokeWidth={2.4} strokeLinejoin="round" />
      <polyline points={series(mu)} fill="none" stroke="var(--data-green)" strokeWidth={2.4} strokeLinejoin="round" />

      <text x={M_L + PW / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--text-dim)">
        Presión (psi)
      </text>
      <text
        x={13}
        y={M_T + PH / 2}
        textAnchor="middle"
        fontSize={10}
        fill="var(--text-dim)"
        transform={`rotate(-90 13 ${M_T + PH / 2})`}
      >
        Propiedad (norm.)
      </text>
    </svg>
  );
};
