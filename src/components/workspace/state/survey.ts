import type { SurveyRow } from "@/interfaces/workspace";

export type SurveyDraftRow = { md: string; tvd: string };

export type SurveyDraftStatus =
  | { kind: "empty" }
  | { kind: "partial" }
  | { kind: "invalid"; reason: "mdNotIncreasing" | "tvdExceedsMd" }
  | { kind: "ok"; hd: number; angle: number };

// Classifies each draft row and computes HD/angle for the chain of valid stations.
// Empty rows (both fields blank) are skippable — they're silently dropped at save time.
// Partial rows (one field blank/unparseable) and invalid rows (MD not increasing, or a TVD
// change larger than the MD change — physically impossible) participate in neither the
// geometry chain nor a valid save.
export const analyzeSurveyDraft = (rows: SurveyDraftRow[]): SurveyDraftStatus[] => {
  const statuses: SurveyDraftStatus[] = new Array<SurveyDraftStatus>(rows.length);
  const chain: { md: number; tvd: number; index: number }[] = [];
  rows.forEach((r, i) => {
    const mdBlank = r.md.trim() === "";
    const tvdBlank = r.tvd.trim() === "";
    if (mdBlank && tvdBlank) {
      statuses[i] = { kind: "empty" };
      return;
    }
    const md = Number(r.md);
    const tvd = Number(r.tvd);
    if (mdBlank || tvdBlank || !Number.isFinite(md) || !Number.isFinite(tvd)) {
      statuses[i] = { kind: "partial" };
      return;
    }
    const prev = chain[chain.length - 1];
    if (prev) {
      const dMd = md - prev.md;
      if (dMd <= 0) {
        statuses[i] = { kind: "invalid", reason: "mdNotIncreasing" };
        return;
      }
      if (Math.abs(tvd - prev.tvd) > dMd) {
        statuses[i] = { kind: "invalid", reason: "tvdExceedsMd" };
        return;
      }
    }
    chain.push({ md, tvd, index: i });
  });
  deriveSurveyGeometry(chain).forEach((g, j) => {
    statuses[chain[j].index] = { kind: "ok", hd: g.hd, angle: g.angle };
  });
  return statuses;
};

// HD and angle are derived from consecutive MD/TVD pairs, matching the modal's promise that
// "HD y ángulo se calculan automáticamente" — the user only types MD/TVD. Each HD increment
// is rounded to an integer before accumulating; the angle is the deviation from vertical
// (0–90°), direction-agnostic in ΔTVD's sign.
export const deriveSurveyGeometry = (rows: { md: number; tvd: number }[]): SurveyRow[] => {
  let hd = 0;
  return rows.map((row, i) => {
    if (i === 0) return { id: 1, md: row.md, tvd: row.tvd, hd: 0, angle: 0 };
    // Vertical-section gate: until the row's cumulative MD exceeds its TVD by more than
    // half a foot (Math.round(md - tvd) > 0), the well counts as vertical and both values
    // are forced to 0.
    if (Math.round(row.md - row.tvd) <= 0) {
      hd = 0;
      return { id: i + 1, md: row.md, tvd: row.tvd, hd: 0, angle: 0 };
    }
    const prev = rows[i - 1];
    const dMd = row.md - prev.md;
    const dTvd = row.tvd - prev.tvd;
    hd += Math.round(Math.sqrt(Math.max(dMd * dMd - dTvd * dTvd, 0)));
    const angle =
      dMd === 0 ? 0 : 90 - Math.abs((Math.asin(Math.min(1, Math.max(-1, dTvd / dMd))) * 180) / Math.PI);
    return { id: i + 1, md: row.md, tvd: row.tvd, hd, angle };
  });
};
