import type { Block, Doc } from "../doc";
import { serializeDoc } from "../serialize";
import type { Options } from "../types";

export const opts = { maxBlankLines: 2 } as Options;

export function doc(blocks: Block[]): Doc {
  return { title: "", chapters: [{ title: "", blocks }] };
}

export function paragraphs(lines: string[]): Doc {
  return doc(
    lines.map((line) => ({ t: "para", inline: [{ t: "text", value: line }] })),
  );
}

export function render(result: Doc): string {
  return serializeDoc(result, "markdown", opts);
}
