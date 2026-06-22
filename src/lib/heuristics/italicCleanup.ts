import type { Block, Doc, Inline, ListItem } from "../doc";
import { inlineText, mapInlineTree } from "../docTransforms";
import type { TransformStep } from "../types";

const GLUED_PUNCT_BEFORE_EMPHASIS = /[.!?,;:\])}'"»…\u2026\u201D\u2019]/u;
const OPENING_QUOTE = /["\u201C«\u2018]/u;

function isOpeningQuoteBeforeEmphasis(
  char: string,
  prevValue: string,
): boolean {
  if (OPENING_QUOTE.test(char)) return true;
  if (char === "'") {
    const prev = prevValue.at(-2);
    return !prev || /[\s([]/u.test(prev);
  }
  return false;
}

function trimEmphasis(inline: Inline[]): Inline[] {
  return mapInlineTree(inline, (node) => {
    if (node.t !== "emph" && node.t !== "strong") return node;
    return {
      ...node,
      children: trimBoundaryText(node.children),
    };
  });
}

function trimBoundaryText(inline: Inline[]): Inline[] {
  const result = [...inline];
  const first = result[0];
  if (first?.t === "text")
    result[0] = { ...first, value: first.value.trimStart() };
  const last = result[result.length - 1];
  if (last?.t === "text")
    result[result.length - 1] = { ...last, value: last.value.trimEnd() };
  return result;
}

function needsSpaceBefore(prev: Inline | undefined): boolean {
  if (prev?.t !== "text") return false;
  const before = prev.value.at(-1);
  if (!before || /\s/u.test(before)) return false;
  if (isOpeningQuoteBeforeEmphasis(before, prev.value)) return false;
  if (GLUED_PUNCT_BEFORE_EMPHASIS.test(before)) return true;
  if (!/\w/u.test(before)) return false;
  return prev.value.length < 2 || prev.value.at(-2) !== "'";
}

function needsSpaceAfter(next: Inline | undefined): boolean {
  if (next?.t !== "text") return false;
  const after = next.value[0];
  if (!after || /\s/u.test(after)) return false;
  if (!/\w/u.test(after)) return false;
  return next.value.length < 2 || next.value[1] !== "'";
}

function spaceEmphasis(inline: Inline[]): Inline[] {
  const trimmed = trimEmphasis(inline);
  const result: Inline[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    const node = trimmed[i]!;
    const isEmphasis = node.t === "emph" || node.t === "strong";
    if (isEmphasis && inlineText(node.children)) {
      if (needsSpaceBefore(result[result.length - 1])) {
        result.push({ t: "text", value: " " });
      }
      result.push(node);
      if (needsSpaceAfter(trimmed[i + 1])) {
        result.push({ t: "text", value: " " });
      }
    } else {
      result.push(node);
    }
  }
  return result;
}

function cleanBlock(block: Block): Block {
  if (block.t === "heading" || block.t === "para") {
    return { ...block, inline: spaceEmphasis(block.inline) };
  }
  if (block.t === "quote") {
    return { ...block, children: block.children.map(cleanBlock) };
  }
  if (block.t === "list") {
    return {
      ...block,
      items: block.items.map(cleanListItem),
    };
  }
  return block;
}

function cleanListItem(item: ListItem): ListItem {
  return { children: item.children.map(cleanBlock) };
}

export const italicCleanup: TransformStep = (doc: Doc) => ({
  ...doc,
  chapters: doc.chapters.map((chapter) => ({
    ...chapter,
    blocks: chapter.blocks.map(cleanBlock),
  })),
});
