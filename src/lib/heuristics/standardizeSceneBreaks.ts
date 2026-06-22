import type { Block, ListItem } from "../doc";
import { inlineText } from "../docTransforms";
import { isSceneBreakLine, SCENE_BREAK } from "../markdown";
import type { TransformStep } from "../types";

export { isSceneBreakLine, SCENE_BREAK };

function standardizeBlock(block: Block): Block {
  if (block.t === "para" && isSceneBreakLine(inlineText(block.inline))) {
    return { t: "sceneBreak" };
  }
  if (block.t === "quote") {
    return { ...block, children: standardizeBlocks(block.children) };
  }
  if (block.t === "list") {
    return { ...block, items: block.items.map(standardizeListItem) };
  }
  return block;
}

function standardizeListItem(item: ListItem): ListItem {
  return { children: standardizeBlocks(item.children) };
}

function standardizeBlocks(blocks: Block[]): Block[] {
  return blocks.map(standardizeBlock);
}

export const standardizeSceneBreaks: TransformStep = (doc) => ({
  ...doc,
  chapters: doc.chapters.map((chapter) => ({
    ...chapter,
    blocks: standardizeBlocks(chapter.blocks),
  })),
});
