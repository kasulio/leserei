import type { Book, Options } from "../types";

/** Soft hyphens and invisible formatting characters not covered elsewhere. */
const INVISIBLE_CHARS = /[\u00AD\uFEFF\u200B-\u200F\u2060\u2061-\u2064]/g;

function stripLine(line: string): string {
  return line.replace(INVISIBLE_CHARS, "");
}

export function stripInvisible(book: Book, _opts: Options): Book {
  return {
    ...book,
    chapters: book.chapters.map((ch) => ({
      ...ch,
      lines: ch.lines.map(stripLine),
    })),
  };
}
