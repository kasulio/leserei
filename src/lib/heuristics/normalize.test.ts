import { expect, test } from "bun:test";

import { DEFAULT_MAX_BLANK_LINES, normalize } from "./normalize";
import { opts, paragraphs, render } from "./testUtils";

const normalizeOpts = { ...opts, maxBlankLines: DEFAULT_MAX_BLANK_LINES };

test("smart double quotes -> straight", () => {
  expect(
    render(normalize(paragraphs(["\u201CHello\u201D"]), normalizeOpts)),
  ).toBe('"Hello"');
});

test("smart single quote / apostrophe", () => {
  expect(render(normalize(paragraphs(["it\u2019s"]), normalizeOpts))).toBe(
    "it's",
  );
});

test("em dash -> --- (calibre)", () => {
  expect(render(normalize(paragraphs(["one\u2014two"]), normalizeOpts))).toBe(
    "one---two",
  );
});

test("en dash -> -- (calibre)", () => {
  expect(render(normalize(paragraphs(["2020\u20132021"]), normalizeOpts))).toBe(
    "2020--2021",
  );
});

test("HTML entities (calibre set)", () => {
  expect(
    render(
      normalize(
        paragraphs(["&ldquo;Hi&rdquo;", "&mdash;", "&#8230;"]),
        normalizeOpts,
      ),
    ),
  ).toBe('"Hi"\n\n---\n...');
});

test("hex HTML entities", () => {
  expect(
    render(normalize(paragraphs(["&#x2014; wait &#x2026;"]), normalizeOpts)),
  ).toBe("--- wait ...");
});

test("ellipsis -> ...", () => {
  expect(render(normalize(paragraphs(["wait\u2026"]), normalizeOpts))).toBe(
    "wait...",
  );
});

test("non-breaking space -> regular space", () => {
  expect(
    render(normalize(paragraphs(["hello\u00A0world"]), normalizeOpts)),
  ).toBe("hello world");
});

test("French guillemets -> straight double quotes", () => {
  expect(
    render(normalize(paragraphs(["\u00ABBonjour\u00BB"]), normalizeOpts)),
  ).toBe('"Bonjour"');
});

test("single guillemets -> straight single quotes", () => {
  expect(
    render(normalize(paragraphs(["\u2039mot\u203A"]), normalizeOpts)),
  ).toBe("'mot'");
});

test("figure dash and minus sign -> hyphen", () => {
  expect(
    render(normalize(paragraphs(["a\u2012b", "x\u2212y"]), normalizeOpts)),
  ).toBe("a-b\nx-y");
});

test("zero-width characters removed", () => {
  expect(render(normalize(paragraphs(["hel\u200Blo"]), normalizeOpts))).toBe(
    "hello",
  );
});

test("fullwidth punctuation -> ASCII", () => {
  expect(render(normalize(paragraphs(["\uFF1F\uFF01"]), normalizeOpts))).toBe(
    "?!",
  );
});

test("trims trailing spaces", () => {
  expect(render(normalize(paragraphs(["hello   "]), normalizeOpts))).toBe(
    "hello",
  );
});

test("collapses internal double spaces", () => {
  expect(render(normalize(paragraphs(["hello  world"]), normalizeOpts))).toBe(
    "hello world",
  );
});

test("leaves scene-break-looking prose as text", () => {
  const result = normalize(paragraphs(["***"]), normalizeOpts);

  expect(result.chapters[0]?.blocks[0]).toEqual({
    t: "para",
    inline: [{ t: "text", value: "***" }],
  });
});
