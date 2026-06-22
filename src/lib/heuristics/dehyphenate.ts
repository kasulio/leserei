import type { Book, Options } from "../types";

// Matches a line ending with a hyphenated word fragment: word-
const HYPHEN_END_RE = /^(.*\S)-$/u;

function joinLines(lines: string[]): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line === undefined) break;
    const match = HYPHEN_END_RE.exec(line);

    if (match) {
      let j = i + 1;
      if (lines[j] === "" && lines[j + 1] !== undefined) j++;
      const next = lines[j];
      // Join only when next fragment starts with a lowercase letter (real word continuation)
      if (next !== undefined && /^[a-z]/u.test(next)) {
        // Remove the hyphen and concatenate
        const joined = match[1] + next;
        result.push(joined);
        i = j + 1;
        continue;
      }
    }

    result.push(line);
    i++;
  }
  return result;
}

export function dehyphenate(book: Book, _opts: Options): Book {
  return {
    ...book,
    chapters: book.chapters.map((ch) => ({
      ...ch,
      lines: joinLines(ch.lines),
    })),
  };
}
