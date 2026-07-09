import type { SurveyRow } from "@/interfaces/workspace";

// HD and angle are derived from consecutive MD/TVD pairs, matching the modal's promise that
// "HD y ángulo se calculan automáticamente" — the user only types MD/TVD.
export const deriveSurveyGeometry = (rows: { md: number; tvd: number }[]): SurveyRow[] => {
  let hd = 0;
  return rows.map((row, i) => {
    if (i === 0) return { id: 1, md: row.md, tvd: row.tvd, hd: 0, angle: 0 };
    const prev = rows[i - 1];
    const dMd = row.md - prev.md;
    const dTvd = row.tvd - prev.tvd;
    hd += Math.sqrt(Math.max(dMd * dMd - dTvd * dTvd, 0));
    const angle = dMd === 0 ? 0 : (Math.acos(Math.min(1, Math.max(-1, dTvd / dMd))) * 180) / Math.PI;
    return { id: i + 1, md: row.md, tvd: row.tvd, hd, angle };
  });
};
