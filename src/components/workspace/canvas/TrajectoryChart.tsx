import { SURVEY } from "@/lib/data";

const W = 560;
const H = 388;
const M_L = 58;
const M_R = 30;
const M_T = 52;
const M_B = 46;
const PW = W - M_L - M_R;
const PH = H - M_T - M_B;
const TVD_MAX = 6300;
const ANG_MAX = 75;
const HD_MAX = 5700;

const xA = (a: number) => M_L + (a / ANG_MAX) * PW;
const xH = (h: number) => M_L + (h / HD_MAX) * PW;
const y = (v: number) => M_T + (v / TVD_MAX) * PH;

const TVD_TICKS = [0, 700, 1400, 2100, 2800, 3500, 4200, 4900, 5600, 6300];
const ANG_TICKS = [0, 15, 30, 45, 60, 75];
const HD_TICKS = [0, 950, 1900, 2850, 3800, 4750, 5700];

export const TrajectoryChart = () => {
  const greenPoints = SURVEY.map((d) => `${xH(d.hd)},${y(d.tvd)}`).join(" ");
  const bluePoints = SURVEY.map((d) => `${xA(d.ang)},${y(d.tvd)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <rect x={M_L} y={M_T} width={PW} height={PH} fill="var(--chart-plot)" stroke="var(--border)" />

      {TVD_TICKS.map((t) => (
        <g key={`tvd-${t}`}>
          <line x1={M_L} y1={y(t)} x2={M_L + PW} y2={y(t)} stroke="var(--grid)" strokeWidth={1} />
          <text x={M_L - 8} y={y(t) + 3} textAnchor="end" fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {t}
          </text>
          <text x={M_L + PW + 8} y={y(t) + 3} fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {t}
          </text>
        </g>
      ))}

      {ANG_TICKS.map((a) => (
        <g key={`ang-${a}`}>
          <line x1={xA(a)} y1={M_T} x2={xA(a)} y2={M_T + PH} stroke="var(--grid)" strokeWidth={1} />
          <text x={xA(a)} y={M_T + PH + 15} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {a}
          </text>
        </g>
      ))}

      {HD_TICKS.map((h) => (
        <text
          key={`hd-${h}`}
          x={xH(h)}
          y={M_T - 9}
          textAnchor="middle"
          fontSize={8.5}
          fill="var(--text-faint)"
          fontFamily="IBM Plex Mono"
        >
          {h}
        </text>
      ))}

      <polyline points={greenPoints} fill="none" stroke="var(--data-green)" strokeWidth={2} />
      <polyline points={bluePoints} fill="none" stroke="var(--data-blue)" strokeWidth={2} />

      {SURVEY.map((d, i) => (
        <g key={`pt-${i}`}>
          <circle cx={xH(d.hd)} cy={y(d.tvd)} r={2.4} fill="var(--data-green)" />
          <circle cx={xA(d.ang)} cy={y(d.tvd)} r={2.4} fill="var(--data-blue)" />
        </g>
      ))}

      <text x={M_L + PW / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--text-dim)">
        Ángulo de inclinación (°)
      </text>
      <text x={M_L + PW / 2} y={15} textAnchor="middle" fontSize={9.5} fill="var(--text-faint)">
        Desplazamiento horizontal, HD (ft)
      </text>
      <text
        x={15}
        y={M_T + PH / 2}
        textAnchor="middle"
        fontSize={10}
        fill="var(--text-dim)"
        transform={`rotate(-90 15 ${M_T + PH / 2})`}
      >
        TVD (ft)
      </text>
    </svg>
  );
};
