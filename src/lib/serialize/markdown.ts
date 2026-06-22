import type { Block, Doc, Inline } from "../doc";
import { headingPrefix, needsParagraphGap, SCENE_BREAK } from "../markdown";
import type { Book, Chapter } from "../types";

function escapeText(text: string): string {
  return text.replace(/([\\`*[])/g, "\\$1");
}

function escapeLineStart(line: string): string {
  return line.replace(/^([#+>-])(?=\s|$)/, "\\$1");
}

export function serializeMarkdownInline(inline: Inline[]): string {
  let text = "";
  for (const node of inline) {
    if (node.t === "text") {
      text += escapeText(node.value);
    } else if (node.t === "emph") {
      text += `*${serializeMarkdownInline(node.children).trim()}*`;
    } else if (node.t === "strong") {
      text += `**${serializeMarkdownInline(node.children).trim()}**`;
    } else if (node.t === "code") {
      text += `\`${node.value.replace(/`/g, "\\`").replace(/\s+/g, " ")}\``;
    } else if (node.t === "link") {
      const inner = serializeMarkdownInline(node.children);
      if (node.href.includes("://")) {
        const title = node.title ? ` "${node.title.replace(/\s+/g, " ")}"` : "";
        text += `[${inner}](${node.href}${title})`;
      } else {
        text += inner;
      }
    } else if (node.t === "break") {
      text += "  \n";
    }
  }
  return text.trim();
}

function blockLines(block: Block, quoteDepth = 0): string[] {
  const quote = "> ".repeat(quoteDepth);
  if (block.t === "heading") {
    const text = serializeMarkdownInline(block.inline);
    return text ? [quote + headingPrefix(block.level) + text] : [];
  }
  if (block.t === "para") {
    const text = serializeMarkdownInline(block.inline);
    return text ? [quote + escapeLineStart(text)] : [];
  }
  if (block.t === "sceneBreak") return [quote + SCENE_BREAK];
  if (block.t === "codeBlock") {
    return block.value.split("\n").map((line) => `${quote}    ${line}`);
  }
  if (block.t === "quote") {
    return blocksToLines(block.children, quoteDepth + 1);
  }
  const lines: string[] = [];
  block.items.forEach((item, index) => {
    const text = serializeMarkdownInline(item);
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

export function serializeMarkdownChapter(
  chapter: Doc["chapters"][number],
): Chapter {
  return {
    title: chapter.title,
    lines: blocksToLines(chapter.blocks),
  };
}

export function docToMarkdownBook(doc: Doc): Book {
  return {
    title: doc.title,
    chapters: doc.chapters
      .map(serializeMarkdownChapter)
      .filter((chapter) => chapter.lines.length > 0),
  };
}
