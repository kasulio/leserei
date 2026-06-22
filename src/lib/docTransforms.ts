import type { Block, Doc, Inline, ListItem } from "./doc";

export function inlineText(inline: Inline[]): string {
  let text = "";
  for (const node of inline) {
    if (node.t === "text" || node.t === "code") text += node.value;
    else if (node.t === "emph" || node.t === "strong" || node.t === "link") {
      text += inlineText(node.children);
    } else if (node.t === "break") text += "\n";
  }
  return text.trim();
}

export function textInline(value: string): Inline[] {
  return value ? [{ t: "text", value }] : [];
}

export function appendInline(left: Inline[], right: Inline[]): Inline[] {
  const result = [...left];
  for (const node of right) {
    const prev = result[result.length - 1];
    if (prev?.t === "text" && node.t === "text") {
      result[result.length - 1] = { ...prev, value: prev.value + node.value };
    } else {
      result.push(node);
    }
  }
  return result;
}

export function appendInlineWithSpace(
  left: Inline[],
  right: Inline[],
): Inline[] {
  return appendInline(appendInline(left, textInline(" ")), right);
}

export function removeTrailingInlineChar(
  inline: Inline[],
  char: string,
): Inline[] | null {
  for (let i = inline.length - 1; i >= 0; i--) {
    const node = inline[i]!;
    if (node.t === "break") return null;
    if (node.t === "text" || node.t === "code") {
      if (!node.value.endsWith(char)) return null;
      const next = [...inline];
      const value = node.value.slice(0, -char.length);
      if (value) next[i] = { ...node, value };
      else next.splice(i, 1);
      return next;
    }
    if (node.t === "emph" || node.t === "strong" || node.t === "link") {
      const children = removeTrailingInlineChar(node.children, char);
      if (!children) return null;
      const next = [...inline];
      next[i] = { ...node, children };
      return next;
    }
  }
  return null;
}

export function mapInlineText(
  inline: Inline[],
  transform: (value: string) => string,
): Inline[] {
  return inline.map((node) => {
    if (node.t === "text") return { ...node, value: transform(node.value) };
    if (node.t === "code" || node.t === "break") return node;
    return { ...node, children: mapInlineText(node.children, transform) };
  });
}

export function mapInlineTree(
  inline: Inline[],
  transform: (node: Inline) => Inline,
): Inline[] {
  return inline.map((node) => {
    if (node.t === "emph" || node.t === "strong" || node.t === "link") {
      return transform({
        ...node,
        children: mapInlineTree(node.children, transform),
      });
    }
    return transform(node);
  });
}

function mapListItemText(
  item: ListItem,
  transform: (value: string) => string,
): ListItem {
  return {
    children: item.children.map((block) => mapBlockText(block, transform)),
  };
}

export function mapBlockText(
  block: Block,
  transform: (value: string) => string,
): Block {
  if (block.t === "heading" || block.t === "para") {
    return { ...block, inline: mapInlineText(block.inline, transform) };
  }
  if (block.t === "quote") {
    return {
      ...block,
      children: block.children.map((child) => mapBlockText(child, transform)),
    };
  }
  if (block.t === "list") {
    return {
      ...block,
      items: block.items.map((item) => mapListItemText(item, transform)),
    };
  }
  return block;
}

export function mapDocText(
  doc: Doc,
  transform: (value: string) => string,
): Doc {
  return {
    ...doc,
    chapters: doc.chapters.map((chapter) => ({
      ...chapter,
      title: transform(chapter.title),
      blocks: chapter.blocks.map((block) => mapBlockText(block, transform)),
    })),
  };
}

export function mapDocBlocks(
  doc: Doc,
  transform: (blocks: Block[]) => Block[],
): Doc {
  return {
    ...doc,
    chapters: doc.chapters.map((chapter) => ({
      ...chapter,
      blocks: transform(chapter.blocks),
    })),
  };
}
