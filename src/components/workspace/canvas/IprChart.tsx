"use client";

import { useMemo } from "react";
import type { IprCalculationResponse, IprCurvePoint } from "@/lib/api/calculations";
import { EChart } from "@/components/charts/EChart";
import { echarts } from "@/components/charts/echarts";
import type { EChartsOption } from "@/components/charts/echarts";
import { useChartPalette } from "@/components/charts/useChartPalette";
import type { ChartPalette } from "@/components/charts/useChartPalette";
import { fmt, buildLabelStyle, buildAxisStyle, buildGridConfig, buildTooltipBase, buildLegendConfig } from "@/components/charts/chartOptions";
import type { TooltipParam } from "@/components/charts/chartOptions";
import { MarkLineComponent, MarkPointComponent, DataZoomComponent } from "echarts/components";
import type { ComposeOption } from "echarts/core";
import type { MarkLineComponentOption, MarkPointComponentOption, DataZoomComponentOption } from "echarts/components";

// Registered here (not in the shared `echarts.ts`) — markLine/markPoint/dataZoom are specific
// to this chart's reference lines, design-point overlay, and zoom; `use()` is idempotent so
// scattering registrations per-chart keeps each chart's tree-shaken bundle to what it renders.
echarts.use([MarkLineComponent, MarkPointComponent, DataZoomComponent]);

type IprEChartsOption = EChartsOption & ComposeOption<MarkLineComponentOption | MarkPointComponentOption | DataZoomComponentOption>;
type MarkLineDataItem = NonNullable<MarkLineComponentOption["data"]>[number];
type MarkLinePair = Extract<MarkLineDataItem, unknown[]>;
type MarkPointDataItem = NonNullable<MarkPointComponentOption["data"]>[number];

type IprChartProps = {
  result: IprCalculationResponse;
  reservoirPressure: number;
  bubblePointPressure: number;
};

const buildIprOption = (
  result: IprCalculationResponse,
  reservoirPressure: number,
  bubblePointPressure: number,
  c: ChartPalette,
): IprEChartsOption => {
  const curvePoints: IprCurvePoint[] = result.curvePoints ?? [];
  const designPoint = result.designPoint;
  const hasDesign =
    designPoint != null && designPoint.totalFlowRate != null && designPoint.requiredFlowingBottomholePressure != null;
  const dpQ = designPoint?.totalFlowRate ?? 0;
  const dpQo = designPoint?.oilFlowRate ?? 0;
  const dpPwf = designPoint?.requiredFlowingBottomholePressure ?? 0;

  // Single pass over curvePoints (up to 101 points): waterCut=0 detection (spec §4 — Qo/Qt
  // coincide, the overlapped series adds no information), axis-domain maxima (fallbacks for
  // when a form field is cleared post-calc), and both series' [x, y] tuples in one loop —
  // plotted in exact array order, never sorted (spec §2: the Qo curve ends in a vertical
  // segment once oil production hits its ceiling while total liquid rate keeps climbing).
  let qoIsRedundant = true;
  let maxQt = 1;
  let maxPwf = 1;
  const qtData: number[][] = [];
  const qoData: number[][] = [];
  for (const p of curvePoints) {
    const qt = p.totalFlowRate ?? 0;
    const pwf = p.flowingBottomholePressure ?? 0;
    if ((p.waterFlowRate ?? 0) !== 0) qoIsRedundant = false;
    if (qt > maxQt) maxQt = qt;
    if (pwf > maxPwf) maxPwf = pwf;
    qtData.push([qt, pwf]);
    if (!qoIsRedundant) qoData.push([p.oilFlowRate ?? 0, pwf]);
  }

  // Domains per spec §3.
  const psY = Number.isFinite(reservoirPressure) && reservoirPressure > 0 ? reservoirPressure : maxPwf;
  const xMax = Math.ceil((result.absoluteOpenFlow ?? maxQt) * 1.1);
  const yMax = Math.ceil(psY * 1.1);

  const labelStyle = buildLabelStyle(c);

  const referenceLines: MarkLineDataItem[] = [
    {
      yAxis: psY,
      lineStyle: { color: c.dataOrange, type: "dashed" as const, width: 1.5 },
      label: { ...labelStyle, formatter: `Ps ${fmt(psY)} psia`, position: "insideEndTop" as const, color: c.dataOrange },
    },
    {
      yAxis: bubblePointPressure,
      lineStyle: { color: c.danger, type: "dashed" as const, width: 1.5 },
      label: { ...labelStyle, formatter: `Pb ${fmt(bubblePointPressure)} psia`, position: "insideStartTop" as const, color: c.danger },
    },
    {
      yAxis: result.operatingPointPressure ?? 0,
      lineStyle: { color: c.textFaint, type: "dashed" as const, width: 1 },
      label: {
        ...labelStyle,
        formatter: `P transición ${fmt(result.operatingPointPressure)} psia`,
        position: "insideEndBottom" as const,
        color: c.textFaint,
      },
    },
  ];

  // §6 guide lines: fixed-coordinate pairs (marker → each axis), not axis-to-axis lines.
  const designGuideStyle = { lineStyle: { color: c.amber, type: "dashed" as const, width: 1 }, label: { show: false } };
  const designGuides: MarkLinePair[] = hasDesign
    ? [
        [{ coord: [0, dpPwf], symbol: "none" }, { coord: [dpQ, dpPwf], symbol: "none", ...designGuideStyle }] as MarkLinePair,
        [{ coord: [dpQ, 0], symbol: "none" }, { coord: [dpQ, dpPwf], symbol: "none", ...designGuideStyle }] as MarkLinePair,
      ]
    : [];

  const axisStyle = buildAxisStyle(c);

  return {
    animation: false,
    legend: { ...buildLegendConfig(c), show: !qoIsRedundant },
    grid: buildGridConfig(c),
    tooltip: {
      ...buildTooltipBase(c),
      formatter: (params: TooltipParam | TooltipParam[]) => {
        const first = Array.isArray(params) ? params[0] : params;
        const point = first ? curvePoints[first.dataIndex] : undefined;
        if (!point) return "";
        return [
          `Pwf: <b>${fmt(point.flowingBottomholePressure)}</b> psia`,
          `Qt (líquido): <b>${fmt(point.totalFlowRate)}</b> STB/d`,
          `Qo (petróleo): <b>${fmt(point.oilFlowRate)}</b> STB/d`,
          `Qw (agua): <b>${fmt(point.waterFlowRate)}</b> STB/d`,
        ].join("<br/>");
      },
    },
    // minValueSpan floors how far a user can zoom in — without it, an axis can be zoomed into a
    // near-zero-width window where the plotted line collapses to a flat/degenerate render.
    dataZoom: [
      { type: "inside", xAxisIndex: 0, filterMode: "none", minValueSpan: xMax * 0.05 },
      { type: "inside", yAxisIndex: 0, filterMode: "none", minValueSpan: yMax * 0.05 },
    ],
    xAxis: { type: "value", min: 0, max: xMax, name: "Tasa de líquido (STB/d)", nameLocation: "middle", nameGap: 28, ...axisStyle },
    yAxis: { type: "value", min: 0, max: yMax, name: "Presión de fondo fluyente (psia)", nameLocation: "middle", nameGap: 46, ...axisStyle },
    series: [
      {
        name: "Qt — líquido total",
        type: "line",
        data: qtData,
        showSymbol: false,
        lineStyle: { width: 2.4, color: c.dataBlue },
        itemStyle: { color: c.dataBlue },
        markLine: {
          silent: true,
          symbol: "none",
          animation: false,
          data: [...referenceLines, ...designGuides],
        },
        ...(hasDesign
          ? {
              markPoint: {
                silent: true,
                animation: false,
                data: [
                  {
                    name: "Diseño",
                    coord: [dpQ, dpPwf],
                    symbol: "circle",
                    symbolSize: 10,
                    itemStyle: { color: c.amber, borderColor: c.surface, borderWidth: 2 },
                    label: { show: true, formatter: "Diseño", position: "right", color: c.amber, fontFamily: c.fontMono, fontSize: 10, fontWeight: 600 },
                  } satisfies MarkPointDataItem,
                ],
              },
            }
          : {}),
      },
      ...(qoIsRedundant
        ? []
        : [
            {
              name: "Qo — petróleo",
              type: "line" as const,
              data: qoData,
              showSymbol: false,
              lineStyle: { width: 2, color: c.dataGreen },
              itemStyle: { color: c.dataGreen },
              ...(hasDesign
                ? {
                    markPoint: {
                      silent: true,
                      animation: false,
                      data: [
                        {
                          name: "Diseño Qo",
                          coord: [dpQo, dpPwf],
                          symbol: "circle",
                          symbolSize: 7,
                          itemStyle: { color: c.amber, borderColor: c.surface, borderWidth: 1.5 },
                          label: { show: false },
                        } satisfies MarkPointDataItem,
                      ],
                    },
                  }
                : {}),
            },
          ]),
    ],
  };
};

export const IprChart = ({ result, reservoirPressure, bubblePointPressure }: IprChartProps) => {
  const palette = useChartPalette();
  const option = useMemo(
    () => (palette ? buildIprOption(result, reservoirPressure, bubblePointPressure, palette) : null),
    [result, reservoirPressure, bubblePointPressure, palette],
  );

  return <EChart<IprEChartsOption> option={option} className="w-full aspect-[5/3]" />;
};
