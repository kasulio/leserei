import { isSceneBreakLine, SCENE_BREAK } from "../markdown";
import type { Book, Options } from "../types";

export { isSceneBreakLine, SCENE_BREAK };

function standardizeLine(line: string): string {
  return isSceneBreakLine(line) ? SCENE_BREAK : line;
}

export function standardizeSceneBreaks(book: Book, _opts: Options): Book {
  return {
    ...book,
    chapters: book.chapters.map((ch) => ({
      ...ch,
      lines: ch.lines.map(standardizeLine),
    })),
  };
}
