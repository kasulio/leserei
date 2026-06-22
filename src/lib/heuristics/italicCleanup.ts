import { isMarkdownStructural, unescapeMarkdownProse } from "../markdown";
import type { Book, Options } from "../types";

function cleanEmphasis(line: string): string {
  if (isMarkdownStructural(unescapeMarkdownProse(line.trim()))) return line;

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

export function italicCleanup(book: Book, _opts: Options): Book {
  return {
    ...book,
    chapters: book.chapters.map((ch) => ({
      ...ch,
      lines: ch.lines.map(cleanEmphasis),
    })),
  };
}
