import { expect, test } from "bun:test";

import type { Book, Options } from "../types";
import { DEFAULT_MAX_BLANK_LINES, normalize } from "./normalize";

function book(lines: string[]): Book {
  return { title: "", chapters: [{ title: "", lines }] };
}

const opts = { maxBlankLines: DEFAULT_MAX_BLANK_LINES } as Options;

test("smart double quotes -> straight", () => {
  const result = normalize(book(["\u201CHello\u201D"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe('"Hello"');
});

test("smart single quote / apostrophe", () => {
  const result = normalize(book(["it\u2019s"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("it's");
});

test("em dash -> --- (calibre)", () => {
  const result = normalize(book(["one\u2014two"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("one---two");
});

test("en dash -> -- (calibre)", () => {
  const result = normalize(book(["2020\u20132021"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("2020--2021");
});

test("HTML entities (calibre set)", () => {
  const result = normalize(
    book(["&ldquo;Hi&rdquo;", "&mdash;", "&#8230;"]),
    opts,
  );
  expect(result.chapters[0]!.lines[0]!).toBe('"Hi"');
  expect(result.chapters[0]!.lines[1]).toBe("---");
  expect(result.chapters[0]!.lines[2]).toBe("...");
});

test("hex HTML entities", () => {
  const result = normalize(book(["&#x2014; wait &#x2026;"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("--- wait ...");
});

test("ellipsis -> ...", () => {
  const result = normalize(book(["wait\u2026"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("wait...");
});

test("non-breaking space -> regular space", () => {
  const result = normalize(book(["hello\u00A0world"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("hello world");
});

test("French guillemets -> straight double quotes", () => {
  const result = normalize(book(["\u00ABBonjour\u00BB"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe('"Bonjour"');
});

test("single guillemets -> straight single quotes", () => {
  const result = normalize(book(["\u2039mot\u203A"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("'mot'");
});

test("figure dash and minus sign -> hyphen", () => {
  const result = normalize(book(["a\u2012b", "x\u2212y"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("a-b");
  expect(result.chapters[0]!.lines[1]).toBe("x-y");
});

test("zero-width characters removed", () => {
  const result = normalize(book(["hel\u200Blo"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("hello");
});

test("fullwidth punctuation -> ASCII", () => {
  const result = normalize(book(["\uFF1F\uFF01"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("?!");
});

test("trims trailing spaces", () => {
  const result = normalize(book(["hello   "]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("hello");
});

test("collapses internal double spaces", () => {
  const result = normalize(book(["hello  world"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("hello world");
});

test("preserves up to 2 consecutive blank lines", () => {
  const result = normalize(book(["a", "", "", "b"]), opts);
  expect(result.chapters[0]!.lines).toEqual(["a", "", "", "b"]);
});

test("caps runs of blank lines at 2", () => {
  const result = normalize(book(["a", "", "", "", "", "b"]), opts);
  expect(result.chapters[0]!.lines).toEqual(["a", "", "", "b"]);
});

test("respects custom maxBlankLines", () => {
  const result = normalize(book(["a", "", "", "", "b"]), {
    ...opts,
    maxBlankLines: 1,
  });
  expect(result.chapters[0]!.lines).toEqual(["a", "", "b"]);
});

test("treats whitespace-only lines as blank", () => {
  const result = normalize(book(["a", " \t", " \t", "b"]), opts);
  expect(result.chapters[0]!.lines).toEqual(["a", "", "", "b"]);
});

test("strips leading and trailing blank lines", () => {
  const result = normalize(book(["", "a", ""]), opts);
  expect(result.chapters[0]!.lines).toEqual(["a"]);
});

test("leaves scene break text unchanged", () => {
  const result = normalize(book(["***"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("***");
});
