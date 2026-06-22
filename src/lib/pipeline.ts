import { dehyphenate } from "./heuristics/dehyphenate";
import { italicCleanup } from "./heuristics/italicCleanup";
import { normalize } from "./heuristics/normalize";
import { standardizeSceneBreaks } from "./heuristics/standardizeSceneBreaks";
import { stripInvisible } from "./heuristics/stripInvisible";
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
  { id: "stripInvisible", fn: stripInvisible },
  { id: "standardizeSceneBreaks", fn: standardizeSceneBreaks },
  { id: "italicCleanup", fn: italicCleanup },
  { id: "dehyphenate", fn: dehyphenate },
  { id: "unwrap", fn: unwrap },
];

/** Blank lines between spine chapters in markdown output (two visible gaps). */
export const CHAPTER_GAP = "\n\n\n";

export const CHAPTER_SEPARATOR = `${CHAPTER_GAP}* * *${CHAPTER_GAP}`;

/** Max consecutive newline characters between content (2 = one blank line). */
export function collapseExcessNewlines(
  text: string,
  maxBlankLines: number,
): string {
  if (maxBlankLines < 0) return text;
  const maxRun = maxBlankLines === 0 ? 1 : maxBlankLines * 2;
  return text.replace(/\n+/g, (run) =>
    run.length <= maxRun ? run : "\n".repeat(maxRun),
  );
}

export function defaultOptions(): Options {
  return { ...PRESETS.find((p) => p.id === "reading")!.options };
}

export function runPipeline(
  book: Book,
  opts: Options,
  _format: OutputFormat = "markdown",
): Book {
  let current = structuredClone(book);
  for (const step of PIPELINE) {
    if (!opts[step.id]) continue;
    current = step.fn(current, opts);
  }
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
  opts?: Pick<Options, "normalize" | "maxBlankLines">,
): string {
  let text: string;
  if (format === "markdown") {
    text = book.chapters
      .map((ch) => joinOutputLines(ch.lines))
      .join(CHAPTER_GAP);
  } else {
    text = book.chapters
      .map((ch) => joinOutputLines(ch.lines))
      .join(CHAPTER_SEPARATOR);
  }

  if (opts?.normalize) {
    text = collapseExcessNewlines(text, opts.maxBlankLines);
  }

  return text;
}
