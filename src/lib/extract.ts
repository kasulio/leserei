import type { SpineItem } from "./epub";
import {
  escapeMarkdown,
  headingPrefix,
  needsParagraphGap,
  unescapeMarkdownProse,
} from "./markdown";
import type { Book, Chapter, OutputFormat } from "./types";

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
    // <br> is inline-ish; extract via extractInline/extractPlainText, not walk()
    if (BLOCK_TAGS.has(tag) || tag === "hr") return true;
  }
  return false;
}

interface ListState {
  type: "ul" | "ol";
  num: number;
}

interface WalkState {
  blockquoteDepth: number;
  listStack: ListState[];
  inPre: boolean;
}

export function extractBook(
  spine: SpineItem[],
  bookTitle = "",
  format: OutputFormat = "markdown",
): Book {
  const chapters: Chapter[] = [];

  for (const item of spine) {
    const chapter = extractChapter(item.content, format);
    if (chapter.lines.length === 0) continue;
    chapters.push(chapter);
  }

  return { title: bookTitle, chapters };
}

function extractChapter(xhtml: string, format: OutputFormat): Chapter {
  const doc = new DOMParser().parseFromString(xhtml, "application/xhtml+xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    const doc2 = new DOMParser().parseFromString(xhtml, "text/html");
    return walkDoc(doc2, format);
  }

  return walkDoc(doc, format);
}

function walkDoc(doc: Document, format: OutputFormat): Chapter {
  const lines: string[] = [];
  let title = "";
  const state: WalkState = { blockquoteDepth: 0, listStack: [], inPre: false };

  function pushBlockLine(line: string): void {
    if (!line) return;
    const prev = lines[lines.length - 1];
    if (prev !== undefined && prev !== "" && needsParagraphGap(prev, line)) {
      lines.push("");
    }
    lines.push(line);
  }

  function walk(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    const tag = tagName(el);
    if (SKIP_TAGS.has(tag)) return;

    if (tag === "br") {
      lines.push("");
      return;
    }

    if (tag === "hr") {
      pushBlockLine("* * *");
      return;
    }

    if (tag === "blockquote") {
      state.blockquoteDepth++;
      for (const child of Array.from(el.childNodes)) walk(child);
      state.blockquoteDepth--;
      return;
    }

    if (tag === "ul" || tag === "ol") {
      state.listStack.push({ type: tag, num: 0 });
      for (const child of Array.from(el.childNodes)) walk(child);
      state.listStack.pop();
      return;
    }

    if (tag === "li") {
      const list = state.listStack[state.listStack.length - 1];
      const prefix = list
        ? list.type === "ul"
          ? "+ "
          : `${++list.num}. `
        : "+ ";
      const indent = "\t".repeat(Math.max(0, state.listStack.length - 1));
      const bq = "> ".repeat(state.blockquoteDepth);
      const text =
        format === "markdown"
          ? extractInline(el, { inPre: state.inPre, inCode: false })
          : extractPlainText(el).trim();
      if (text) pushBlockLine(indent + bq + prefix + text);
      return;
    }

    if (tag === "pre") {
      state.inPre = true;
      const text = el.textContent ?? "";
      for (const line of text.split("\n")) {
        pushBlockLine(
          state.blockquoteDepth > 0 ? `>     ${line}` : `    ${line}`,
        );
      }
      state.inPre = false;
      return;
    }

    if (BLOCK_TAGS.has(tag)) {
      if (format === "markdown" && isHeadingTag(tag)) {
        const level = Number(tag[1]);
        const text = extractInline(el, { inPre: false, inCode: false });
        if (text) {
          const bq = "> ".repeat(state.blockquoteDepth);
          const line = bq + headingPrefix(level) + text;
          pushBlockLine(line);
          if (!title) title = unescapeMarkdownProse(text);
        }
        return;
      }

      if (hasNestedBlockElements(el)) {
        for (const child of Array.from(el.childNodes)) walk(child);
        return;
      }

      const text =
        format === "markdown"
          ? extractInline(el, { inPre: state.inPre, inCode: false })
          : extractPlainText(el).trim();

      if (text) {
        const bq = "> ".repeat(state.blockquoteDepth);
        pushBlockLine(bq + text);
        if (!title && isHeadingTag(tag)) title = text;
      }
      return;
    }

    for (const child of Array.from(el.childNodes)) walk(child);
  }

  const body = doc.querySelector("body") ?? doc.documentElement;
  for (const child of Array.from(body.childNodes)) {
    walk(child);
  }

  return { title, lines };
}

interface InlineContext {
  inPre: boolean;
  inCode: boolean;
}

function formatText(text: string, ctx: InlineContext): string {
  if (ctx.inPre) return text;
  if (ctx.inCode) return text.replace(/\s+/g, " ");
  return escapeMarkdown(text.replace(/\s+/g, " "));
}

function extractInline(el: Element, ctx: InlineContext): string {
  let text = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += formatText(node.textContent ?? "", ctx);
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const child = node as Element;
    const tag = tagName(child);

    if (tag === "br") {
      text += "  \n";
      continue;
    }

    if (tag === "strong" || tag === "b") {
      text += `**${extractInline(child, ctx)}**`;
      continue;
    }

    if (tag === "em" || tag === "i" || tag === "cite") {
      text += `*${extractInline(child, ctx)}*`;
      continue;
    }

    if (tag === "code") {
      text += `\`${extractInline(child, { ...ctx, inCode: true })}\``;
      continue;
    }

    if (tag === "a") {
      const href = child.getAttribute("href") ?? "";
      const inner = extractInline(child, ctx);
      if (href.includes("://")) {
        const title = child.getAttribute("title");
        const titlePart = title ? ` "${title.replace(/\s+/g, " ")}"` : "";
        text += `[${inner}](${href}${titlePart})`;
      } else {
        text += inner;
      }
      continue;
    }

    if (tag === "img") {
      continue;
    }

    if (BLOCK_TAGS.has(tag)) {
      const inner = extractInline(child, ctx).trim();
      if (inner) text += (text ? "\n" : "") + inner;
      continue;
    }

    text += extractInline(child, ctx);
  }
  return text.trim();
}

function extractPlainText(el: Element): string {
  let text = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      const tag = tagName(child);
      if (tag === "br") {
        text += "\n";
      } else if (BLOCK_TAGS.has(tag)) {
        const inner = extractPlainText(child).trim();
        if (inner) text += (text ? "\n" : "") + inner;
      } else {
        text += extractPlainText(child);
      }
    }
  }
  return text;
}
