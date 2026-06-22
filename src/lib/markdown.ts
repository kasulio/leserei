export const SCENE_BREAK = "* * *";

export function isAsteriskDividerLine(line: string): boolean {
  return /^\*(\s*\*){2,}$/.test(line);
}

/** Lines that are only scene-divider ornaments (not prose). */
export function isSceneBreakLine(line: string): boolean {
  const t = line.trim();
  if (t === SCENE_BREAK) return true;
  if (isAsteriskDividerLine(t)) return true;
  const unescaped = t.replace(/\\\*/g, "*");
  if (unescaped !== t && isAsteriskDividerLine(unescaped)) return true;
  if (/^[-_#~=](\s*[-_#~=]){2,}$/.test(t)) return true;
  if (/^\.{3,}$/.test(t)) return true;
  if (/^[·•](\s*[·•]){2,}$/.test(t)) return true;
  return false;
}
