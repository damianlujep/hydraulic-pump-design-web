"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export type ChartPalette = {
  dataBlue: string;
  dataGreen: string;
  dataOrange: string;
  danger: string;
  amber: string;
  text: string;
  textDim: string;
  textFaint: string;
  grid: string;
  border: string;
  surface: string;
  chartPlot: string;
  fontMono: string;
};

const readVar = (styles: CSSStyleDeclaration, name: string): string => styles.getPropertyValue(name).trim();

const readPalette = (): ChartPalette => {
  const styles = getComputedStyle(document.documentElement);
  return {
    dataBlue: readVar(styles, "--data-blue"),
    dataGreen: readVar(styles, "--data-green"),
    dataOrange: readVar(styles, "--data-orange"),
    danger: readVar(styles, "--danger"),
    amber: readVar(styles, "--amber"),
    text: readVar(styles, "--text"),
    textDim: readVar(styles, "--text-dim"),
    textFaint: readVar(styles, "--text-faint"),
    grid: readVar(styles, "--grid"),
    border: readVar(styles, "--border"),
    surface: readVar(styles, "--surface"),
    chartPlot: readVar(styles, "--chart-plot"),
    // Read the leaf `--font-mono-ibm` (the literal font stack next/font injects), not the
    // composed `--font-mono` token — getComputedStyle never substitutes a var() reference
    // nested inside another custom property, so reading the composed token would hand
    // ECharts the literal unresolved string "var(--font-mono-ibm), monospace".
    fontMono: `${readVar(styles, "--font-mono-ibm")}, monospace`,
  };
};

const initialPalette = (): ChartPalette | null => (typeof document === "undefined" ? null : readPalette());

export const useChartPalette = (): ChartPalette | null => {
  const { theme } = useTheme();
  const [palette, setPalette] = useState<ChartPalette | null>(initialPalette);
  const isMount = useRef(true);

  // ThemeProvider flips data-theme in its own effect, which runs AFTER this hook's effect in
  // the same commit (parent effects run after child effects) — a synchronous read here would
  // see the outgoing theme's tokens. One rAF defers the read to after all commit effects.
  // Skipped on mount: the lazy initial state above already read the current (correct) theme.
  useEffect(() => {
    if (isMount.current) {
      isMount.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => setPalette(readPalette()));
    return () => cancelAnimationFrame(frame);
  }, [theme]);

  return palette;
};
