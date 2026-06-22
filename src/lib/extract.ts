import type { Block, Doc, DocChapter, Inline } from "./doc";
import { inlineText } from "./docTransforms";
import type { SpineItem } from "./epub";
import { documentBody, parseHtmlDocument } from "./html";

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "section",
  "article",
  "aside",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "dt",
  "dd",
  "tr",
  "td",
  "th",
  "pre",
  "figure",
  "figcaption",
  "header",
  "footer",
  "main",
  "nav",
]);

const SKIP_TAGS = new Set(["script", "style", "nav", "head"]);

function tagName(el: Element): string {
  return (el.localName ?? el.tagName).toLowerCase();
}

function isHeadingTag(tag: string): boolean {
  return /^h[1-6]$/.test(tag);
}

function hasNestedBlockElements(el: Element): boolean {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const tag = tagName(node as Element);
    if (BLOCK_TAGS.has(tag) || tag === "ul" || tag === "ol" || tag === "hr") {
      return true;
    }
  }
  return false;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ");
}

function extractInline(el: Element): Inline[] {
  const inline: Inline[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = normalizeText(node.textContent ?? "");
      if (value) inline.push({ t: "text", value });
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const child = node as Element;
    const tag = tagName(child);

    if (tag === "br") {
      inline.push({ t: "break" });
    } else if (tag === "strong" || tag === "b") {
      inline.push({ t: "strong", children: extractInline(child) });
    } else if (tag === "em" || tag === "i" || tag === "cite") {
      inline.push({ t: "emph", children: extractInline(child) });
    } else if (tag === "code") {
      inline.push({
        t: "code",
        value: normalizeText(child.textContent ?? "").trim(),
      });
    } else if (tag === "a") {
      const title = child.getAttribute("title") ?? undefined;
      inline.push({
        t: "link",
        href: child.getAttribute("href") ?? "",
        title,
        children: extractInline(child),
      });
    } else if (tag !== "img") {
      inline.push(...extractInline(child));
    }
  }
  return inline;
}

function extractList(el: Element, ordered: boolean): Block | null {
  const items: Array<{ children: Block[] }> = [];
  for (const child of Array.from(el.children)) {
    if (tagName(child) !== "li") continue;
    const children = hasNestedBlockElements(child)
      ? extractBlocksFromChildren(child)
      : [{ t: "para" as const, inline: extractInline(child) }];
    if (children.some((block) => blockText(block))) items.push({ children });
  }
  return items.length ? { t: "list", ordered, items } : null;
}

function blockText(block: Block): string {
  if (block.t === "heading" || block.t === "para")
    return inlineText(block.inline);
  if (block.t === "quote")
    return block.children.map(blockText).join(" ").trim();
  if (block.t === "list") {
    return block.items
      .map((item) => item.children.map(blockText).join(" "))
      .join(" ")
      .trim();
  }
  if (block.t === "codeBlock") return block.value.trim();
  return "* * *";
}

function extractBlocksFromChildren(el: Element): Block[] {
  const blocks: Block[] = [];
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    blocks.push(...extractBlocks(child as Element));
  }
  return blocks;
}

function extractBlocks(el: Element): Block[] {
  const tag = tagName(el);
  if (SKIP_TAGS.has(tag)) return [];

  if (tag === "hr") return [{ t: "sceneBreak" }];

  if (tag === "blockquote") {
    const children = extractBlocksFromChildren(el);
    return children.length ? [{ t: "quote", children }] : [];
  }

  if (tag === "ul" || tag === "ol") {
    const list = extractList(el, tag === "ol");
    return list ? [list] : [];
  }

  if (tag === "pre") {
    const value = el.textContent ?? "";
    return value ? [{ t: "codeBlock", value }] : [];
  }

  if (isHeadingTag(tag)) {
    const inline = extractInline(el);
    return inlineText(inline)
      ? [{ t: "heading", level: Number(tag[1]), inline }]
      : [];
  }

  if (BLOCK_TAGS.has(tag)) {
    if (hasNestedBlockElements(el)) return extractBlocksFromChildren(el);
    const inline = extractInline(el);
    return inlineText(inline) ? [{ t: "para", inline }] : [];
  }

  return extractBlocksFromChildren(el);
}

function extractChapterDoc(item: SpineItem): DocChapter {
  const doc = item.parsed ?? parseHtmlDocument(item.content);
  const body = documentBody(doc);
  const blocks = extractBlocksFromChildren(body);
  const heading = blocks.find((block) => block.t === "heading");
  const title = heading?.t === "heading" ? inlineText(heading.inline) : "";
  return { title, blocks };
}

export function extractDoc(spine: SpineItem[], bookTitle = ""): Doc {
  const chapters = spine
    .map((item) => extractChapterDoc(item))
    .filter((chapter) => chapter.blocks.length > 0);
  return { title: bookTitle, chapters };
}
