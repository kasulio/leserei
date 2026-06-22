import { dehyphenate } from "./heuristics/dehyphenate";
import { italicCleanup } from "./heuristics/italicCleanup";
import { normalize } from "./heuristics/normalize";
import { unescapeMarkdown } from "./heuristics/unescapeMarkdown";
import { unwrap } from "./heuristics/unwrap";
import { PRESETS } from "./presets";
import type {
  Book,
  Options,
  OutputFormat,
  StepId,
  TransformStep,
} from "./types";

const PIPELINE: Array<{ id: StepId; fn: TransformStep }> = [
  { id: "normalize", fn: normalize },
  { id: "italicCleanup", fn: italicCleanup },
  { id: "dehyphenate", fn: dehyphenate },
  { id: "unwrap", fn: unwrap },
];

/** Blank lines between spine chapters in markdown output (two visible gaps). */
export const CHAPTER_GAP = "\n\n\n";

export const CHAPTER_SEPARATOR = `${CHAPTER_GAP}* * *${CHAPTER_GAP}`;

export function defaultOptions(): Options {
  return { ...PRESETS[0]!.options };
}

export function runPipeline(
  book: Book,
  opts: Options,
  format: OutputFormat = "markdown",
): Book {
  let current = structuredClone(book);
  for (const step of PIPELINE) {
    if (!opts[step.id]) continue;
    current = step.fn(current, opts);
  }
  if (format === "markdown") current = unescapeMarkdown(current, opts);
  return current;
}

/**
 * Join block lines: `\n\n` between content blocks; each additional consecutive
 * `""` entry adds one extra blank line (e.g. from multiple `<br>`).
 */
export function joinOutputLines(lines: string[]): string {
  let out = "";
  let pendingBlanks = 0;

  for (const line of lines) {
    if (line === "") {
      pendingBlanks++;
      continue;
    }
    if (out.length > 0) {
      const extras = Math.max(0, pendingBlanks - 1);
      out += `\n\n${extras > 0 ? "\n".repeat(extras) : ""}`;
    }
    out += line;
    pendingBlanks = 0;
  }

  return out;
}

export function bookToText(
  book: Book,
  format: OutputFormat = "markdown",
): string {
  if (format === "markdown") {
    return book.chapters
      .map((ch) => joinOutputLines(ch.lines))
      .join(CHAPTER_GAP);
  }

  return book.chapters
    .map((ch) => joinOutputLines(ch.lines))
    .join(CHAPTER_SEPARATOR);
}
