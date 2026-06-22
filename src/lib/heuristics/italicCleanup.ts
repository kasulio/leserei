import { isMarkdownStructural } from "../markdown";
import type { Book, Options } from "../types";

const GLUED_PUNCT_BEFORE_EMPHASIS = /[.!?,;:\])}'"»…\u2026\u201D\u2019]/u;

// Greedy `**` over `*`; backreference matches the same marker on close, so
// bold and italic are handled in one pass with no ordering concern.
const EMPHASIS = /(\*\*?)([^*]+?)\1/g;

function needsSpaceBeforeEmphasis(line: string, index: number): boolean {
  if (index <= 0) return false;
  const ch = line[index - 1]!;
  if (/\s/u.test(ch)) return false;
  if (GLUED_PUNCT_BEFORE_EMPHASIS.test(ch)) return true;
  if (!/\w/u.test(ch)) return false;
  return index < 2 || line[index - 2]! !== "'";
}

function needsSpaceAfterEmphasis(line: string, index: number): boolean {
  if (index >= line.length) return false;
  const ch = line[index]!;
  if (/\s/u.test(ch)) return false;
  if (!/\w/u.test(ch)) return false;
  return index + 1 >= line.length || line[index + 1]! !== "'";
}

/** Trim inside markers and space outside them when glued to words/punctuation. */
function fixEmphasis(line: string): string {
  return line.replace(
    EMPHASIS,
    (match, marker: string, inner: string, offset: number) => {
      const trimmed = inner.trim();
      if (!trimmed) return match;
      // Boundary chars sit outside the span, so original offsets stay valid.
      const before = needsSpaceBeforeEmphasis(line, offset) ? " " : "";
      const after = needsSpaceAfterEmphasis(line, offset + match.length)
        ? " "
        : "";
      return `${before}${marker}${trimmed}${marker}${after}`;
    },
  );
}

function cleanEmphasis(line: string): string {
  if (isMarkdownStructural(line.trim())) return line;
  return fixEmphasis(line);
}

export function italicCleanup(book: Book, _opts: Options): Book {
  return {
    ...book,
    chapters: book.chapters.map((ch) => ({
      ...ch,
      lines: ch.lines.map(cleanEmphasis),
    })),
  };
}
