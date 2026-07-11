import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ComposeOption, EChartsType } from "echarts/core";
import type { LineSeriesOption } from "echarts/charts";
import type { GridComponentOption, TooltipComponentOption, LegendComponentOption } from "echarts/components";

// Only the subset every chart on this stack needs (a line series on a value/value grid, with
// tooltip + legend) is registered here. A chart needing more (markLine, markPoint, dataZoom,
// a different series type) calls `echarts.use([...])` itself at module scope in its own file —
// `use()` is idempotent, so scattering additional registrations across chart files is safe and
// keeps each chart's tree-shaken bundle limited to what it actually renders.
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export type EChartsOption = ComposeOption<
  LineSeriesOption | GridComponentOption | TooltipComponentOption | LegendComponentOption
>;
export type EChartsInstance = EChartsType;
export { echarts };
