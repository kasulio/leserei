import { isMarkdownStructural, PARAGRAPH_END_RE } from "../markdown";
import type { Book, Options } from "../types";

// Lines that look like headings (all caps, short, no punctuation) or scene breaks
// should not be joined to the next line.
function isStructural(line: string): boolean {
  if (isMarkdownStructural(line)) return true;
  // Very short line — likely a heading or label
  if (line.length < 4) return true;
  return false;
}

function joinLines(lines: string[]): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line === undefined) break;

    if (isStructural(line)) {
      result.push(line);
      i++;
      continue;
    }

    // If line ends with sentence punctuation, don't join
    if (PARAGRAPH_END_RE.test(line)) {
      result.push(line);
      i++;
      continue;
    }

    // Look ahead: join if next line is non-empty, non-structural, and starts lowercase
    const next = lines[i + 1];
    if (
      next !== undefined &&
      next !== "" &&
      !isStructural(next) &&
      /^[a-z]/u.test(next)
    ) {
      result.push(`${line} ${next}`);
      i += 2;
      continue;
    }

    result.push(line);
    i++;
  }
  return result;
}

export function unwrap(book: Book, _opts: Options): Book {
  return {
    ...book,
    chapters: book.chapters.map((ch) => ({
      ...ch,
      lines: joinLines(ch.lines),
    })),
  };
}
