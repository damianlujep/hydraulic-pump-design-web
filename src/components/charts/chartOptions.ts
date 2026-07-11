import type { ChartPalette } from "./useChartPalette";

export type TooltipParam = { dataIndex: number };

// Cached per decimal count — a tooltip formatter can fire on every mousemove (rAF cadence),
// so avoid constructing a fresh Intl.NumberFormat on each call.
const numberFormatters = new Map<number, Intl.NumberFormat>();

export const fmt = (v: number | undefined | null, decimals = 2): string => {
  let formatter = numberFormatters.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat("es", { minimumFractionDigits: 0, maximumFractionDigits: decimals });
    numberFormatters.set(decimals, formatter);
  }
  return formatter.format(v ?? 0);
};

export const buildLabelStyle = (c: ChartPalette) => ({ fontFamily: c.fontMono, fontSize: 10, fontWeight: 600 as const });

export const buildAxisStyle = (c: ChartPalette) => ({
  nameTextStyle: { color: c.textDim, fontSize: 10 },
  axisLine: { show: true, lineStyle: { color: c.border } },
  axisTick: { show: false },
  axisLabel: { color: c.textDim, fontFamily: c.fontMono, fontSize: 10 },
  splitLine: { show: true, lineStyle: { color: c.grid } },
});

// Fixed, generous margins — NOT `containLabel: true`. That option recomputes the plot's inner
// margin from whatever tick labels are currently rendered, but `nameGap` (the axis name's
// offset) is a fixed pixel distance from the axis line; when zoom changes the tick labels'
// width, the axis line shifts and the name — still offset by the same nameGap — ends up
// colliding with the ticks or pushed off-canvas. Fixed margins sized for the worst case (as
// the original hand-rolled SVG charts used) make the layout independent of zoom/data content.
export const buildGridConfig = (c: ChartPalette) => ({
  show: true as const,
  backgroundColor: c.chartPlot,
  borderColor: c.border,
  left: 58,
  right: 30,
  top: 34,
  bottom: 46,
  containLabel: false as const,
});

export const buildLegendConfig = (c: ChartPalette) => ({
  top: 0,
  left: 0,
  itemWidth: 14,
  itemHeight: 3,
  textStyle: { color: c.textDim, fontSize: 11 },
});

// Every field but `formatter` — each chart spreads this and adds its own formatter.
export const buildTooltipBase = (c: ChartPalette) => ({
  trigger: "axis" as const,
  axisPointer: {
    type: "cross" as const,
    crossStyle: { color: c.textFaint },
    label: { precision: 0, backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, color: c.text, fontFamily: c.fontMono, fontSize: 10 },
  },
  backgroundColor: c.surface,
  borderColor: c.border,
  textStyle: { color: c.text, fontFamily: c.fontMono, fontSize: 11 },
});
