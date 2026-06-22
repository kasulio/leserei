import type { Block, Doc, Inline, ListItem } from "../doc";
import { SCENE_BREAK } from "../markdown";
import type { SerializeOptions } from "./types";

const PARAGRAPH_END_RE = /[.!?:)\]"'»…\u2026\u201D\u2019]$/u;

export function serializePlainInline(inline: Inline[]): string {
  let text = "";
  for (const node of inline) {
    if (node.t === "text") text += node.value;
    else if (node.t === "emph" || node.t === "strong" || node.t === "link") {
      text += serializePlainInline(node.children);
    } else if (node.t === "code") text += node.value.replace(/\s+/g, " ");
    else if (node.t === "break") text += "\n";
  }
  return text.trim();
}

interface RenderedBlock {
  lines: string[];
  kind: Block["t"];
}

function renderListItem(
  item: ListItem,
  index: number,
  ordered: boolean,
): string[] {
  const prefix = ordered ? `${index + 1}. ` : "+ ";
  const blocks = renderBlocks(item.children);
  if (blocks.length === 0) return [];
  return blocks.flatMap((block, blockIndex) =>
    block.lines.map((line, lineIndex) => {
      if (blockIndex === 0 && lineIndex === 0) return prefix + line;
      return `  ${line}`;
    }),
  );
}

function renderBlock(block: Block): RenderedBlock {
  if (block.t === "heading" || block.t === "para") {
    const text = serializePlainInline(block.inline);
    return { kind: block.t, lines: text ? [text] : [] };
  }
  if (block.t === "sceneBreak") return { kind: block.t, lines: [SCENE_BREAK] };
  if (block.t === "codeBlock")
    return { kind: block.t, lines: block.value.split("\n") };
  if (block.t === "quote") {
    return {
      kind: block.t,
      lines: renderBlocks(block.children)
        .flatMap((rendered) => rendered.lines)
        .map((line) => `> ${line}`),
    };
  }
  return {
    kind: block.t,
    lines: block.items.flatMap((item, index) =>
      renderListItem(item, index, block.ordered),
    ),
  };
}

function renderBlocks(blocks: Block[]): RenderedBlock[] {
  return blocks.map(renderBlock).filter((block) => block.lines.length > 0);
}

function needsBlankLine(prev: RenderedBlock, next: RenderedBlock): boolean {
  if (prev.kind === "list" && next.kind === "list") return false;
  if (prev.kind !== "para" || next.kind !== "para") return true;
  const prevLine = prev.lines[prev.lines.length - 1] ?? "";
  const nextLine = next.lines[0] ?? "";
  if (PARAGRAPH_END_RE.test(prevLine)) return true;
  if (/^[A-Z]/u.test(nextLine)) return true;
  return false;
}

function joinRenderedBlocks(blocks: RenderedBlock[]): string {
  let text = "";
  let prev: RenderedBlock | undefined;
  for (const block of blocks) {
    if (!text) {
      text = block.lines.join("\n");
    } else {
      text += prev && needsBlankLine(prev, block) ? "\n\n" : "\n";
      text += block.lines.join("\n");
    }
    prev = block;
  }
  return text;
}

export function serializePlain(doc: Doc, _opts: SerializeOptions = {}): string {
  return doc.chapters
    .map((chapter) => joinRenderedBlocks(renderBlocks(chapter.blocks)))
    .filter(Boolean)
    .join("\n\n\n* * *\n\n\n");
}
