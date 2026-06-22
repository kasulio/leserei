import type { Block, Doc, Inline } from "../doc";
import { needsParagraphGap, SCENE_BREAK } from "../markdown";
import type { Book, Chapter } from "../types";

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

function blockLines(block: Block, quoteDepth = 0): string[] {
  const quote = "> ".repeat(quoteDepth);
  if (block.t === "heading" || block.t === "para") {
    const text = serializePlainInline(block.inline);
    return text ? [quote + text] : [];
  }
  if (block.t === "sceneBreak") return [quote + SCENE_BREAK];
  if (block.t === "codeBlock")
    return block.value.split("\n").map((line) => quote + line);
  if (block.t === "quote") return blocksToLines(block.children, quoteDepth + 1);
  const lines: string[] = [];
  block.items.forEach((item, index) => {
    const text = serializePlainInline(item);
    if (!text) return;
    const prefix = block.ordered ? `${index + 1}. ` : "+ ";
    lines.push(quote + prefix + text);
  });
  return lines;
}

function pushLine(lines: string[], line: string): void {
  const prev = lines[lines.length - 1];
  if (prev !== undefined && prev !== "" && needsParagraphGap(prev, line)) {
    lines.push("");
  }
  lines.push(line);
}

function blocksToLines(blocks: Block[], quoteDepth = 0): string[] {
  const lines: string[] = [];
  for (const block of blocks) {
    for (const line of blockLines(block, quoteDepth)) {
      if (line) pushLine(lines, line);
    }
  }
  return lines;
}

export function serializePlainChapter(
  chapter: Doc["chapters"][number],
): Chapter {
  return {
    title: chapter.title,
    lines: blocksToLines(chapter.blocks),
  };
}

export function docToPlainBook(doc: Doc): Book {
  return {
    title: doc.title,
    chapters: doc.chapters
      .map(serializePlainChapter)
      .filter((chapter) => chapter.lines.length > 0),
  };
}
