import { isMarkdownStructural, unescapeMarkdownProse } from "../markdown";
import type { Book, Options } from "../types";

type EmphasisSpan = { start: number; end: number };

function emphasisSpans(line: string): EmphasisSpan[] {
  const spans: EmphasisSpan[] = [];

  for (const match of line.matchAll(/\*\*([^*]+)\*\*/g)) {
    spans.push({ start: match.index!, end: match.index! + match[0].length });
  }

  for (const match of line.matchAll(/(?<!\*)\*([^*]+)\*(?!\*)/g)) {
    const start = match.index!;
    const end = start + match[0].length;
    if (!spans.some((span) => start >= span.start && end <= span.end)) {
      spans.push({ start, end });
    }
  }

  return spans.sort((a, b) => a.start - b.start);
}

function gluedToWord(line: string, index: number): boolean {
  if (index <= 0) return false;
  const ch = line[index - 1]!;
  if (!/\w/u.test(ch)) return false;
  return index < 2 || line[index - 2]! !== "'";
}

function gluedFromWord(line: string, index: number): boolean {
  if (index >= line.length) return false;
  const ch = line[index]!;
  if (!/\w/u.test(ch)) return false;
  return index + 1 >= line.length || line[index + 1]! !== "'";
}

function trimInsideEmphasis(line: string): string {
  let result = line.replace(/\*\*([^*]+)\*\*/g, (match, inner: string) => {
    const trimmed = inner.trim();
    return trimmed ? `**${trimmed}**` : match;
  });

  result = result.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    (match, inner: string) => {
      const trimmed = inner.trim();
      return trimmed ? `*${trimmed}*` : match;
    },
  );

  return result;
}

/** Space before/after markers when glued to word chars (not apostrophe contractions). */
function fixEmphasisExteriorSpacing(line: string): string {
  const spans = emphasisSpans(line);
  if (spans.length === 0) return line;

  let result = "";
  let pos = 0;

  for (const span of spans) {
    result += line.slice(pos, span.start);
    if (gluedToWord(line, span.start)) result += " ";
    result += line.slice(span.start, span.end);
    if (gluedFromWord(line, span.end)) result += " ";
    pos = span.end;
  }

  result += line.slice(pos);
  return result;
}

function cleanEmphasis(line: string): string {
  if (isMarkdownStructural(unescapeMarkdownProse(line.trim()))) return line;
  return fixEmphasisExteriorSpacing(trimInsideEmphasis(line));
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
