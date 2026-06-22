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

export function isMarkdownStructural(line: string): boolean {
  if (line === "") return true;
  if (line === "* * *") return true;
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
