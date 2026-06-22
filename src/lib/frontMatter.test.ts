import { expect, test } from "bun:test";

import type { SpineItem } from "./epub";
import { extractBook } from "./extract";
import { filterSpine, isFrontMatterItem } from "./frontMatter";

function item(
  href: string,
  content: string,
  overrides: Partial<SpineItem> = {},
): SpineItem {
  return {
    href,
    content,
    linear: true,
    properties: [],
    ...overrides,
  };
}

test("isFrontMatterItem: linear=no", () => {
  expect(
    isFrontMatterItem(item("ch1.xhtml", "<p>x</p>", { linear: false })),
  ).toBe(true);
});

test("isFrontMatterItem: nav property", () => {
  expect(
    isFrontMatterItem(
      item("toc.xhtml", "<nav><a href='c1'>One</a></nav>", {
        properties: ["nav"],
      }),
    ),
  ).toBe(true);
});

test("isFrontMatterItem: cover href", () => {
  expect(isFrontMatterItem(item("cover.xhtml", "<p>Cover</p>"))).toBe(true);
});

test("isFrontMatterItem: nav-only document", () => {
  expect(
    isFrontMatterItem(
      item(
        "contents.xhtml",
        "<html><body><nav><ol><li><a href='c1'>Chapter 1</a></li></ol></nav></body></html>",
      ),
    ),
  ).toBe(true);
});

test("isFrontMatterItem: chapter body is kept", () => {
  expect(
    isFrontMatterItem(
      item(
        "chapter01.xhtml",
        "<html><body><h1>One</h1><p>Story starts here.</p></body></html>",
      ),
    ),
  ).toBe(false);
});

test("filterSpine leaves all items when disabled", () => {
  const spine = [
    item("nav.xhtml", "<nav></nav>"),
    item("ch1.xhtml", "<p>One</p>"),
  ];
  expect(filterSpine(spine, false)).toHaveLength(2);
});

test("filterSpine removes front matter when enabled", () => {
  const spine = [
    item("nav.xhtml", "<nav><a href='c1'>One</a></nav>", {
      properties: ["nav"],
    }),
    item("chapter01.xhtml", "<p>One</p>"),
  ];
  expect(filterSpine(spine, true).map((s) => s.href)).toEqual([
    "chapter01.xhtml",
  ]);
});

test("extractBook skips nav when removeFrontMatter is on", () => {
  const spine = [
    item(
      "nav.xhtml",
      "<html><body><nav><a href='c1'>One</a></nav></body></html>",
      {
        properties: ["nav"],
      },
    ),
    item(
      "chapter01.xhtml",
      "<html><body><h1>One</h1><p>Story.</p></body></html>",
    ),
  ];
  const book = extractBook(filterSpine(spine, true), "Book", "markdown");

  expect(book.chapters).toHaveLength(1);
  expect(book.chapters[0]!.lines).toContain("# One");
});

test("isFrontMatterItem: table of contents heading page", () => {
  expect(
    isFrontMatterItem(
      item(
        "index0001.xhtml",
        "<html><body><h1>Table of Contents</h1><p><a href='c1.xhtml'>Chapter 1</a></p><p><a href='c2.xhtml'>Chapter 2</a></p><p><a href='c3.xhtml'>Chapter 3</a></p><p><a href='c4.xhtml'>Chapter 4</a></p></body></html>",
      ),
    ),
  ).toBe(true);
});
