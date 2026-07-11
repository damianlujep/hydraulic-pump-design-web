"use client";

import { useMemo } from "react";
import { EChart } from "@/components/charts/EChart";
import { echarts } from "@/components/charts/echarts";
import type { EChartsOption } from "@/components/charts/echarts";
import { useChartPalette } from "@/components/charts/useChartPalette";
import type { ChartPalette } from "@/components/charts/useChartPalette";
import { fmt, buildLabelStyle, buildAxisStyle, buildGridConfig, buildTooltipBase, buildLegendConfig } from "@/components/charts/chartOptions";
import type { TooltipParam } from "@/components/charts/chartOptions";
import { MarkLineComponent, DataZoomComponent } from "echarts/components";
import type { ComposeOption } from "echarts/core";
import type { MarkLineComponentOption, DataZoomComponentOption } from "echarts/components";

// Registered here, not in the shared `echarts.ts` — this chart only needs the Pb reference
// line and zoom; see IprChart.tsx for the same per-chart registration rationale.
echarts.use([MarkLineComponent, DataZoomComponent]);

type PvtEChartsOption = EChartsOption & ComposeOption<MarkLineComponentOption | DataZoomComponentOption>;

const P_MAX = 3000;
const PB = 520;
const STEP = 50;

// Synthetic demo shape functions — no backend PVT endpoint exists yet (see docs-user/refactor-roadmap.md).
// Normalized (0–1): Bo peaks at Pb then declines, Rs rises to 1 at Pb then flattens, μo troughs at Pb then rises.
const rs = (p: number) => (p < PB ? 0.06 + 0.94 * (p / PB) : 1);
const bo = (p: number) => (p < PB ? 0.42 + 0.58 * (p / PB) : 1 - 0.14 * ((p - PB) / (P_MAX - PB)));
const mu = (p: number) => (p < PB ? 1 - 0.72 * (p / PB) : 0.28 + 0.24 * ((p - PB) / (P_MAX - PB)));

// Data is a fixed synthetic curve — sample once at module scope, not on every render.
const samplePressures = Array.from({ length: P_MAX / STEP + 1 }, (_, i) => i * STEP);
const sample = (f: (p: number) => number): [number, number][] => samplePressures.map((p) => [p, f(p)]);
const boData = sample(bo);
const rsData = sample(rs);
const muData = sample(mu);

// Doesn't depend on the palette — a single module-scope instance rather than one per theme toggle.
const pvtTooltipFormatter = (params: TooltipParam | TooltipParam[]) => {
  const first = Array.isArray(params) ? params[0] : params;
  const i = first?.dataIndex;
  if (i == null) return "";
  return [
    `Presión: <b>${fmt(boData[i][0], 0)}</b> psi`,
    `Bo: <b>${fmt(boData[i][1])}</b> rb/stb (norm.)`,
    `Rs: <b>${fmt(rsData[i][1])}</b> scf/stb (norm.)`,
    `μo: <b>${fmt(muData[i][1])}</b> cp (norm.)`,
  ].join("<br/>");
};

const buildPvtOption = (c: ChartPalette): PvtEChartsOption => {
  const axisStyle = buildAxisStyle(c);

  return {
    animation: false,
    legend: buildLegendConfig(c),
    grid: buildGridConfig(c),
    tooltip: { ...buildTooltipBase(c), formatter: pvtTooltipFormatter },
    // minValueSpan floors how far a user can zoom in — see IprChart.tsx for the same guard.
    dataZoom: [
      { type: "inside", xAxisIndex: 0, filterMode: "none", minValueSpan: P_MAX * 0.05 },
      { type: "inside", yAxisIndex: 0, filterMode: "none", minValueSpan: 0.05 },
    ],
    xAxis: { type: "value", min: 0, max: P_MAX, name: "Presión (psi)", nameLocation: "middle", nameGap: 28, ...axisStyle },
    yAxis: { type: "value", min: 0, max: 1, name: "Propiedad (norm.)", nameLocation: "middle", nameGap: 46, ...axisStyle },
    series: [
      {
        name: "Bo — factor volumétrico",
        type: "line",
        data: boData,
        showSymbol: false,
        lineStyle: { width: 2.4, color: c.dataBlue },
        itemStyle: { color: c.dataBlue },
        markLine: {
          silent: true,
          symbol: "none",
          animation: false,
          data: [
            {
              xAxis: PB,
              lineStyle: { color: c.danger, type: "dashed" as const, width: 1.5 },
              label: { ...buildLabelStyle(c), formatter: `Pb ${fmt(PB, 0)} psi`, position: "insideEndTop" as const, color: c.danger },
            },
          ],
        },
      },
      { name: "Rs — gas disuelto", type: "line", data: rsData, showSymbol: false, lineStyle: { width: 2, color: c.dataOrange }, itemStyle: { color: c.dataOrange } },
      { name: "μo — viscosidad", type: "line", data: muData, showSymbol: false, lineStyle: { width: 2, color: c.dataGreen }, itemStyle: { color: c.dataGreen } },
    ],
  };
};

export const PvtChart = () => {
  const palette = useChartPalette();
  const option = useMemo(() => (palette ? buildPvtOption(palette) : null), [palette]);

  return <EChart<PvtEChartsOption> option={option} className="w-full aspect-[5/3]" />;
};
