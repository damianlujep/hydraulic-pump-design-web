export type PasswordStrength = {
  reqLen: boolean;
  reqUp: boolean;
  reqNum: boolean;
  reqSym: boolean;
  idx: 0 | 1 | 2 | 3 | 4;
  label: string;
  colorVar: string;
  fillPercent: number;
};

const LABELS = ["", "Muy débil", "Débil", "Media", "Fuerte"];
const COLORS = [
  "var(--border)",
  "var(--danger)",
  "var(--amber)",
  "var(--data-blue)",
  "var(--green)",
];

export const computePasswordStrength = (pw: string): PasswordStrength => {
  const reqLen = pw.length >= 8;
  const reqUp = /[A-Z]/.test(pw);
  const reqNum = /[0-9]/.test(pw);
  const reqSym = /[^A-Za-z0-9]/.test(pw);

  const count = [reqLen, reqUp, reqNum, reqSym].filter(Boolean).length as 0 | 1 | 2 | 3 | 4;

  return {
    reqLen,
    reqUp,
    reqNum,
    reqSym,
    idx: count,
    label: LABELS[count],
    colorVar: COLORS[count],
    fillPercent: count * 25,
  };
};
