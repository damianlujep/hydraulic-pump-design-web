"use client";

import { useEffect, useRef } from "react";
import { echarts } from "./echarts";
import type { EChartsInstance, EChartsOption } from "./echarts";

type EChartProps<T extends EChartsOption = EChartsOption> = {
  option: T | null;
  className?: string;
  // Full-replace by default — safe for charts with no interactive legend/toggle state to
  // preserve across option rebuilds. A chart that needs to keep user toggles across
  // re-renders (e.g. a legend-driven series toggle) should pass `notMerge={false}`.
  notMerge?: boolean;
};

export const EChart = <T extends EChartsOption = EChartsOption>({ option, className, notMerge = true }: EChartProps<T>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<EChartsInstance | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = echarts.init(el);
    chartRef.current = chart;
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(el);
    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (option) chartRef.current?.setOption(option, { notMerge });
  }, [option, notMerge]);

  return <div ref={containerRef} className={className} />;
};
