import type { Doc } from "./doc";
import { serializeMarkdown } from "./serialize/markdown";
import { serializePlain } from "./serialize/plain";
import type { SerializeOptions } from "./serialize/types";
import type { OutputFormat } from "./types";

export function collapseExcessNewlines(
  text: string,
  maxBlankLines = 2,
): string {
  if (maxBlankLines < 0) return text;
  const maxRun = maxBlankLines === 0 ? 1 : maxBlankLines * 2;
  return text.replace(/\n+/g, (run) =>
    run.length <= maxRun ? run : "\n".repeat(maxRun),
  );
}

export function serializeDoc(
  doc: Doc,
  format: OutputFormat = "markdown",
  opts: SerializeOptions = {},
): string {
  const text =
    format === "plain"
      ? serializePlain(doc, opts)
      : serializeMarkdown(doc, opts);
  return collapseExcessNewlines(text, opts.maxBlankLines ?? 2);
}
