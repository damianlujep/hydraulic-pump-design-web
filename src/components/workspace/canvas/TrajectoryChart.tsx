"use client";

import { useMemo } from "react";
import type { SurveyRow } from "@/interfaces/workspace";
import { EChart } from "@/components/charts/EChart";
import { echarts } from "@/components/charts/echarts";
import type { EChartsOption } from "@/components/charts/echarts";
import { useChartPalette } from "@/components/charts/useChartPalette";
import type { ChartPalette } from "@/components/charts/useChartPalette";
import { fmt, buildAxisStyle, buildGridConfig, buildTooltipBase, buildLegendConfig } from "@/components/charts/chartOptions";
import type { TooltipParam } from "@/components/charts/chartOptions";
import { DataZoomComponent } from "echarts/components";
import type { ComposeOption } from "echarts/core";
import type { DataZoomComponentOption } from "echarts/components";

// Registered here, not in the shared `echarts.ts` — this chart only needs zoom; see
// IprChart.tsx for the same per-chart registration rationale.
echarts.use([DataZoomComponent]);

type TrajectoryEChartsOption = EChartsOption & ComposeOption<DataZoomComponentOption>;

const buildTrajectoryOption = (rows: SurveyRow[], c: ChartPalette): TrajectoryEChartsOption => {
  const axisStyle = buildAxisStyle(c);

  // Single pass building both series' [x, y] tuples — same shape as IprChart's Qt/Qo loop.
  let maxTvd = 1;
  const angleData: number[][] = [];
  const hdData: number[][] = [];
  for (const r of rows) {
    if (r.tvd > maxTvd) maxTvd = r.tvd;
    angleData.push([r.angle, r.tvd]);
    hdData.push([r.hd, r.tvd]);
  }

  return {
    animation: false,
    legend: buildLegendConfig(c),
    grid: { ...buildGridConfig(c), top: 70 },
    tooltip: {
      ...buildTooltipBase(c),
      // A single horizontal read-line tied to TVD (depth) — the two series live on independent
      // X scales (angle, horizontal displacement), so a vertical crosshair would be ambiguous.
      axisPointer: { type: "line", axis: "y", lineStyle: { color: c.textFaint } },
      formatter: (params: TooltipParam | TooltipParam[]) => {
        const first = Array.isArray(params) ? params[0] : params;
        const row = first ? rows[first.dataIndex] : undefined;
        if (!row) return "";
        return [
          `MD: <b>${fmt(row.md, 0)}</b> ft`,
          `TVD: <b>${fmt(row.tvd, 0)}</b> ft`,
          `Ángulo: <b>${fmt(row.angle, 1)}</b> °`,
          `HD: <b>${fmt(row.hd, 0)}</b> ft`,
        ].join("<br/>");
      },
    },
    // Y-axis (depth) zoom only — the two X axes have unrelated units (degrees vs. feet), so a
    // shared percentage-window zoom across both would clip each series to a different depth
    // section and show two curves that no longer correspond to the same interval of the well.
    // minValueSpan floors the zoom depth — without it, zooming past a few percent of the well's
    // total depth collapses both series onto a near-flat line (a real, previously-seen render bug).
    dataZoom: [{ type: "inside", yAxisIndex: 0, filterMode: "none", minValueSpan: maxTvd * 0.05 }],
    xAxis: [
      { type: "value", min: 0, position: "bottom", name: "Ángulo de inclinación (°)", nameLocation: "middle", nameGap: 28, ...axisStyle },
      { type: "value", min: 0, position: "top", name: "Desplazamiento horizontal, HD (ft)", nameLocation: "middle", nameGap: 28, ...axisStyle },
    ],
    yAxis: { type: "value", min: 0, inverse: true, name: "TVD (ft)", nameLocation: "middle", nameGap: 46, ...axisStyle },
    series: [
      {
        name: "Ángulo (°)",
        type: "line",
        xAxisIndex: 0,
        data: angleData,
        showSymbol: true,
        symbolSize: 5,
        lineStyle: { width: 2, color: c.dataBlue },
        itemStyle: { color: c.dataBlue },
      },
      {
        name: "Trayectoria MD/HD",
        type: "line",
        xAxisIndex: 1,
        data: hdData,
        showSymbol: true,
        symbolSize: 5,
        lineStyle: { width: 2, color: c.dataGreen },
        itemStyle: { color: c.dataGreen },
      },
    ],
  };
};

export const TrajectoryChart = ({ rows }: { rows: SurveyRow[] }) => {
  const palette = useChartPalette();
  const option = useMemo(() => (palette ? buildTrajectoryOption(rows, palette) : null), [rows, palette]);

  if (rows.length === 0) return null;

  return <EChart<TrajectoryEChartsOption> option={option} className="w-full aspect-[560/388]" />;
};
