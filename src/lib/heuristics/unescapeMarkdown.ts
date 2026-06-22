import { unescapeMarkdownProse } from "../markdown";
import type { Book, Options } from "../types";

/** Strip unnecessary backslash escapes left from markdown extraction. */
export function unescapeMarkdown(book: Book, _opts: Options): Book {
  return {
    ...book,
    chapters: book.chapters.map((ch) => ({
      ...ch,
      title: unescapeMarkdownProse(ch.title),
      lines: ch.lines.map(unescapeMarkdownProse),
    })),
  };
}
