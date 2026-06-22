import type { Block, ListItem } from "../doc";
import { appendInlineWithSpace, inlineText } from "../docTransforms";
import type { TransformStep } from "../types";

const PARAGRAPH_END_RE = /[.!?:)\]"'»…\u2026\u201D\u2019]$/u;

function unwrapBlocks(blocks: Block[]): Block[] {
  const result: Block[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = unwrapNestedBlock(blocks[i]!);
    if (block.t !== "para") {
      result.push(block);
      i++;
      continue;
    }

    const text = inlineText(block.inline);
    const next = blocks[i + 1] ? unwrapNestedBlock(blocks[i + 1]!) : undefined;
    if (next?.t === "para") {
      const nextText = inlineText(next.inline);
      if (!PARAGRAPH_END_RE.test(text) && /^[a-z]/u.test(nextText)) {
        result.push({
          t: "para",
          inline: appendInlineWithSpace(block.inline, next.inline),
        });
        i += 2;
        continue;
      }
    }

    result.push(block);
    i++;
  }
  return result;
}

function unwrapListItem(item: ListItem): ListItem {
  return { children: unwrapBlocks(item.children) };
}

function unwrapNestedBlock(block: Block): Block {
  if (block.t === "quote")
    return { ...block, children: unwrapBlocks(block.children) };
  if (block.t === "list")
    return { ...block, items: block.items.map(unwrapListItem) };
  return block;
}

export const unwrap: TransformStep = (doc) => ({
  ...doc,
  chapters: doc.chapters.map((chapter) => ({
    ...chapter,
    blocks: unwrapBlocks(chapter.blocks),
  })),
});
