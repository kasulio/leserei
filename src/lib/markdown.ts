/** Escape text for Markdown (Calibre markdownml.prepare_string_for_markdown). */
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+!])/g, "\\$1");
}

/** Remove backslash escapes that are unnecessary in prose markdown output. */
export function unescapeMarkdownProse(text: string): string {
  return text.replace(/\\([!()*])/g, "$1");
}

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

export function isMarkdownStructural(line: string): boolean {
  if (line === "") return true;
  if (isSceneBreakLine(line)) return true;
  if (/^#{1,6}\s/.test(line)) return true;
  if (/^>\s?/.test(line)) return true;
  if (/^(\+ |\d+\. )/.test(line)) return true;
  if (/^ {4}/.test(line)) return true;
  return false;
}

/** Line ends a sentence/block — next block should get a paragraph gap. */
export const PARAGRAPH_END_RE = /[.!?:)\]"'»…\u2026\u201D\u2019]$/u;

export function needsParagraphGap(prev: string, next: string): boolean {
  if (isMarkdownStructural(prev)) return true;
  if (PARAGRAPH_END_RE.test(prev)) return true;
  if (/^[A-Z]/u.test(next)) return true;
  return false;
}
