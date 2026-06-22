import type { SpineItem } from "./epub";

const FRONT_MATTER_HREF =
  /(?:^|\/)(nav|toc|cover|title-?page|titlepage|copyright|dedication|halftitle|half-?title|contents?|colophon|imprint|acknowledgments?|epigraph|praises?|alsoby|also-by|about-?the-?author|frontmatter|front-?matter|fm\d|prelim)(?:[._-]|\.|$)/i;

const SKIP_PROPERTIES = new Set(["nav", "cover-image", "cover"]);

const TOC_HEADING =
  /^(table of contents|contents|inhaltsverzeichnis|table des mati[eè]res)$/i;

function parseBody(xhtml: string): HTMLElement {
  const doc = new DOMParser().parseFromString(xhtml, "application/xhtml+xml");
  if (doc.querySelector("parsererror")) {
    const html = new DOMParser().parseFromString(xhtml, "text/html");
    return (html.querySelector("body") ?? html.documentElement) as HTMLElement;
  }
  return (doc.querySelector("body") ?? doc.documentElement) as HTMLElement;
}

export function isNavDocument(xhtml: string): boolean {
  const body = parseBody(xhtml);
  const nav = body.querySelector("nav");
  if (!nav) return false;

  const bodyText = (body.textContent ?? "").replace(/\s+/g, " ").trim();
  const navText = (nav.textContent ?? "").replace(/\s+/g, " ").trim();
  if (
    navText.length > 0 &&
    bodyText.length > 0 &&
    navText.length / bodyText.length > 0.9
  ) {
    return true;
  }

  const blockChildren = Array.from(body.children).filter((el) => {
    const tag = el.tagName.toLowerCase();
    return tag !== "head" && tag !== "script" && tag !== "style";
  });
  return (
    blockChildren.length === 1 &&
    blockChildren[0]!.tagName.toLowerCase() === "nav"
  );
}

export function isTableOfContentsPage(xhtml: string): boolean {
  const body = parseBody(xhtml);

  for (const el of body.querySelectorAll("*")) {
    const epubType = el.getAttribute("epub:type") ?? "";
    if (/\btoc\b/i.test(epubType)) return true;
  }

  const heading =
    body.querySelector("h1,h2,h3")?.textContent?.replace(/\s+/g, " ").trim() ??
    "";
  if (TOC_HEADING.test(heading)) return true;

  const links = body.querySelectorAll("a[href]");
  const text = (body.textContent ?? "").replace(/\s+/g, " ").trim();
  if (links.length >= 4 && text.length > 0 && text.length < 8000) {
    const linkText = Array.from(links)
      .map((a) => (a.textContent ?? "").replace(/\s+/g, " ").trim())
      .join(" ");
    if (linkText.length / text.length > 0.45) return true;
  }

  return false;
}

export function isFrontMatterItem(item: SpineItem): boolean {
  if (!item.linear) return true;
  if (item.properties.some((p) => SKIP_PROPERTIES.has(p))) return true;

  const base = item.href.split("/").pop() ?? item.href;
  if (FRONT_MATTER_HREF.test(base)) return true;

  return isNavDocument(item.content) || isTableOfContentsPage(item.content);
}

export function filterSpine(
  spine: SpineItem[],
  removeFrontMatter: boolean,
): SpineItem[] {
  if (!removeFrontMatter) return spine;
  return spine.filter((item) => !isFrontMatterItem(item));
}
