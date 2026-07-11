import type { IprCalculationResponse } from "@/lib/api/calculations";
import { buildTicks, niceMax } from "./chartScale";

const W = 560;
const H = 336;
const M_L = 58;
const M_R = 30;
const M_T = 20;
const M_B = 46;
const PW = W - M_L - M_R;
const PH = H - M_T - M_B;

type IprChartProps = {
  result: IprCalculationResponse;
  reservoirPressure: number;
  bubblePointPressure: number;
};

type MarkerProps = {
  x: number;
  y: number;
  x0: number;
  top: number;
  color: string;
  label: string;
  showVerticalGuide?: boolean;
};

// Shared by the Pb marker and the (optional) design-point marker — a dashed guide to the left
// axis, a dot, and a label; the design point additionally gets a dashed guide down from the top.
const Marker = ({ x, y, x0, top, color, label, showVerticalGuide = false }: MarkerProps) => (
  <>
    {showVerticalGuide && (
      <line x1={x} y1={top} x2={x} y2={y} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.55} />
    )}
    <line x1={x0} y1={y} x2={x} y2={y} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.55} />
    <circle cx={x} cy={y} r={4} fill={color} />
    <text x={x + 8} y={y + (showVerticalGuide ? -6 : 4)} fontSize={11} fontWeight={600} fill={color} fontFamily="IBM Plex Mono">
      {label}
    </text>
  </>
);

export const IprChart = ({ result, reservoirPressure, bubblePointPressure }: IprChartProps) => {
  const curvePoints = result.curvePoints ?? [];
  const designPoint = result.designPoint;
  const qMax = niceMax(
    Math.max(result.absoluteOpenFlow ?? 0, designPoint?.totalFlowRate ?? 0, ...curvePoints.map((p) => p.totalFlowRate ?? 0), 1),
  );
  const pMax = niceMax(
    Math.max(reservoirPressure, designPoint?.requiredFlowingBottomholePressure ?? 0, ...curvePoints.map((p) => p.flowingBottomholePressure ?? 0)),
  );

  const X = (q: number) => M_L + (q / qMax) * PW;
  const Y = (p: number) => M_T + (1 - p / pMax) * PH;

  const qTicks = buildTicks(qMax, 5);
  const pTicks = buildTicks(pMax, 6);

  const poly = curvePoints.map((p) => `${X(p.totalFlowRate ?? 0)},${Y(p.flowingBottomholePressure ?? 0)}`).join(" ");
  const qb = result.bubblePointFlowRate ?? 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <rect x={M_L} y={M_T} width={PW} height={PH} fill="var(--chart-plot)" stroke="var(--border)" />

      {qTicks.map((q) => (
        <g key={`q-${q}`}>
          <line x1={X(q)} y1={M_T} x2={X(q)} y2={M_T + PH} stroke="var(--grid)" strokeWidth={1} />
          <text x={X(q)} y={M_T + PH + 15} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {q}
          </text>
        </g>
      ))}

      {pTicks.map((p) => (
        <g key={`p-${p}`}>
          <line x1={M_L} y1={Y(p)} x2={M_L + PW} y2={Y(p)} stroke="var(--grid)" strokeWidth={1} />
          <text x={M_L - 8} y={Y(p) + 3} textAnchor="end" fontSize={9} fill="var(--text-dim)" fontFamily="IBM Plex Mono">
            {p}
          </text>
        </g>
      ))}

      <line x1={X(0)} y1={Y(reservoirPressure)} x2={X(qMax)} y2={Y(reservoirPressure)} stroke="var(--data-blue)" strokeWidth={2} />
      <polyline points={poly} fill="none" stroke="var(--data-orange)" strokeWidth={2.4} strokeLinejoin="round" />
      <Marker x={X(qb)} y={Y(bubblePointPressure)} x0={X(0)} top={M_T} color="var(--data-orange)" label="Pb" />

      {designPoint && designPoint.totalFlowRate != null && designPoint.requiredFlowingBottomholePressure != null && (
        <Marker
          x={X(designPoint.totalFlowRate)}
          y={Y(designPoint.requiredFlowingBottomholePressure)}
          x0={X(0)}
          top={M_T}
          color="var(--data-green)"
          label="Diseño"
          showVerticalGuide
        />
      )}

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
