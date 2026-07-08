const W = 560;
const H = 336;
const M_L = 58;
const M_R = 30;
const M_T = 20;
const M_B = 46;
const PW = W - M_L - M_R;
const PH = H - M_T - M_B;
const Q_MAX = 2200;
const P_MAX = 2300;
const PS = 2300;
const PB = 520;
const J = 1.002;

const X = (q: number) => M_L + (q / Q_MAX) * PW;
const Y = (p: number) => M_T + (1 - p / P_MAX) * PH;

const Q_TICKS = [0, 500, 1000, 1500, 2000];
const P_TICKS = [0, 500, 1000, 1500, 2000, 2300];

function buildIprPoints() {
  const qb = J * (PS - PB);
  const add = (J * PB) / 1.8;
  const pts: [number, number][] = [];
  for (let p = PS; p >= PB; p -= 50) pts.push([J * (PS - p), p]);
  for (let p = PB; p >= 0; p -= 30) {
    const q = qb + add * (1 - 0.2 * (p / PB) - 0.8 * Math.pow(p / PB, 2));
    pts.push([q, p]);
  }
  return { pts, qb };
}

export const IprChart = () => {
  const { pts, qb } = buildIprPoints();
  const poly = pts.map(([q, p]) => `${X(q)},${Y(p)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <rect x={M_L} y={M_T} width={PW} height={PH} fill="var(--chart-plot)" stroke="var(--border)" />

      {Q_TICKS.map((q) => (
        <g key={`q-${q}`}>
          <line x1={X(q)} y1={M_T} x2={X(q)} y2={M_T + PH} stroke="var(--grid)" strokeWidth={1} />
          <text x={X(q)} y={M_T + PH + 15} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {q}
          </text>
        </g>
      ))}

      {P_TICKS.map((p) => (
        <g key={`p-${p}`}>
          <line x1={M_L} y1={Y(p)} x2={M_L + PW} y2={Y(p)} stroke="var(--grid)" strokeWidth={1} />
          <text x={M_L - 8} y={Y(p) + 3} textAnchor="end" fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {p}
          </text>
        </g>
      ))}

      <line x1={X(0)} y1={Y(PS)} x2={X(Q_MAX)} y2={Y(PS)} stroke="var(--data-blue)" strokeWidth={2} />
      <polyline points={poly} fill="none" stroke="var(--data-orange)" strokeWidth={2.4} strokeLinejoin="round" />
      <line
        x1={X(0)}
        y1={Y(PB)}
        x2={X(qb)}
        y2={Y(PB)}
        stroke="var(--data-orange)"
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.55}
      />
      <circle cx={X(qb)} cy={Y(PB)} r={4} fill="var(--data-orange)" />
      <text x={X(qb) + 8} y={Y(PB) + 4} fontSize={11} fontWeight={600} fill="var(--data-orange)" fontFamily="IBM Plex Mono">
        Pb
      </text>

      <text x={M_L + PW / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--text-dim)">
        Tasa (bfpd)
      </text>
      <text
        x={15}
        y={M_T + PH / 2}
        textAnchor="middle"
        fontSize={10}
        fill="var(--text-dim)"
        transform={`rotate(-90 15 ${M_T + PH / 2})`}
      >
        Presión (psi)
      </text>
    </svg>
  );
};
