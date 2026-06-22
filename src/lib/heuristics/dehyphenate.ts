import type { Block, ListItem } from "../doc";
import {
  appendInline,
  inlineText,
  removeTrailingInlineChar,
} from "../docTransforms";
import type { TransformStep } from "../types";

const HYPHEN_END_RE = /^(.*\S)-$/u;

function dehyphenateBlocks(blocks: Block[]): Block[] {
  const result: Block[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = cleanNestedBlock(blocks[i]!);
    if (block.t !== "para") {
      result.push(block);
      i++;
      continue;
    }

    const text = inlineText(block.inline);
    const match = HYPHEN_END_RE.exec(text);
    const next = blocks[i + 1] ? cleanNestedBlock(blocks[i + 1]!) : undefined;
    if (match && next?.t === "para") {
      const nextText = inlineText(next.inline);
      if (/^[a-z]/u.test(nextText)) {
        const withoutHyphen = removeTrailingInlineChar(block.inline, "-");
        if (withoutHyphen) {
          result.push({
            t: "para",
            inline: appendInline(withoutHyphen, next.inline),
          });
        } else {
          result.push(block);
        }
        i += 2;
        continue;
      }
    }

    result.push(block);
    i++;
  }
  return result;
}

function cleanListItem(item: ListItem): ListItem {
  return { children: dehyphenateBlocks(item.children) };
}

function cleanNestedBlock(block: Block): Block {
  if (block.t === "quote") {
    return { ...block, children: dehyphenateBlocks(block.children) };
  }
  if (block.t === "list") {
    return { ...block, items: block.items.map(cleanListItem) };
  }
  return block;
}

export const dehyphenate: TransformStep = (doc) => ({
  ...doc,
  chapters: doc.chapters.map((chapter) => ({
    ...chapter,
    blocks: dehyphenateBlocks(chapter.blocks),
  })),
});
