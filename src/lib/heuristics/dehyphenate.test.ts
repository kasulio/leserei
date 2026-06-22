import { expect, test } from "bun:test";

import type { Book, Options } from "../types";
import { dehyphenate } from "./dehyphenate";

function book(lines: string[]): Book {
  return { title: "", chapters: [{ title: "", lines }] };
}

const opts = {} as Options;

test("joins hyphenated word split across blank line", () => {
  const result = dehyphenate(book(["exam-", "", "ple text."]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("example text.");
});

test("joins hyphenated word split across lines", () => {
  const result = dehyphenate(book(["exam-", "ple text."]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("example text.");
});

test("does not join when next fragment starts uppercase", () => {
  const result = dehyphenate(book(["Some-", "Thing"]), opts);
  expect(result.chapters[0]!.lines).toEqual(["Some-", "Thing"]);
});

test("does not join real end-of-sentence hyphen", () => {
  // e.g. "self-" followed by new sentence
  const result = dehyphenate(book(["self-", "The next sentence."]), opts);
  expect(result.chapters[0]!.lines).toEqual(["self-", "The next sentence."]);
});

test("handles multi-word lines correctly", () => {
  // hyphen removed: "extra-" + "ordinary" -> "extraordinary" (no-dictionary behavior)
  const result = dehyphenate(
    book(["This is extra-", "ordinary indeed."]),
    opts,
  );
  expect(result.chapters[0]!.lines[0]!).toBe("This is extraordinary indeed.");
});

test("leaves non-hyphenated lines untouched", () => {
  const result = dehyphenate(book(["Normal line.", "Another line."]), opts);
  expect(result.chapters[0]!.lines).toEqual(["Normal line.", "Another line."]);
});
