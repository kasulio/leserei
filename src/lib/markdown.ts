export function headingPrefix(level: number): string {
  return `${"#".repeat(Math.min(Math.max(level, 1), 6))} `;
}

export const SCENE_BREAK = "* * *";

function asteriskDivider(line: string): boolean {
  return /^\*(\s*\*){2,}$/.test(line);
}

/** Lines that are only scene-divider ornaments (not prose). */
export function isSceneBreakLine(line: string): boolean {
  const t = line.trim();
  if (t === SCENE_BREAK) return true;
  if (asteriskDivider(t)) return true;
  const unescaped = t.replace(/\\\*/g, "*");
  if (unescaped !== t && asteriskDivider(unescaped)) return true;
  if (/^[-_#~=](\s*[-_#~=]){2,}$/.test(t)) return true;
  if (/^\.{3,}$/.test(t)) return true;
  if (/^[·•](\s*[·•]){2,}$/.test(t)) return true;
  return false;
}

export function isListItemLine(line: string): boolean {
  return /^(\t|(> )+)*(\+ |\d+\. )/.test(line);
}

export function isMarkdownStructural(line: string): boolean {
  if (line === "") return true;
  if (isSceneBreakLine(line)) return true;
  if (/^#{1,6}\s/.test(line)) return true;
  if (/^>\s?/.test(line)) return true;
  if (isListItemLine(line)) return true;
  if (/^ {4}/.test(line)) return true;
  return false;
}

/** Line ends a sentence/block — next block should get a paragraph gap. */
export const PARAGRAPH_END_RE = /[.!?:)\]"'»…\u2026\u201D\u2019]$/u;

export function needsParagraphGap(prev: string, next: string): boolean {
  if (isListItemLine(prev) && isListItemLine(next)) return false;
  if (isMarkdownStructural(prev)) return true;
  if (PARAGRAPH_END_RE.test(prev)) return true;
  if (/^[A-Z]/u.test(next)) return true;
  return false;
}
