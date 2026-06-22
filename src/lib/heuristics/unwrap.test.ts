import { expect, test } from "bun:test";

import type { Book, Options } from "../types";
import { unwrap } from "./unwrap";

function book(lines: string[]): Book {
  return { title: "", chapters: [{ title: "", lines }] };
}

const opts = {} as Options;

test("joins soft-wrapped line when next starts lowercase", () => {
  const result = unwrap(
    book(["The quick brown fox", "jumps over the lazy dog."]),
    opts,
  );
  expect(result.chapters[0]!.lines).toEqual([
    "The quick brown fox jumps over the lazy dog.",
  ]);
});

test("does not join when current line ends with period", () => {
  const result = unwrap(book(["First sentence.", "Second sentence."]), opts);
  expect(result.chapters[0]!.lines).toEqual([
    "First sentence.",
    "Second sentence.",
  ]);
});

test("does not join when next line starts uppercase", () => {
  const result = unwrap(book(["One line", "Another line"]), opts);
  expect(result.chapters[0]!.lines).toEqual(["One line", "Another line"]);
});

test("preserves blank lines as paragraph breaks", () => {
  const result = unwrap(book(["Para one", "", "Para two"]), opts);
  expect(result.chapters[0]!.lines).toEqual(["Para one", "", "Para two"]);
});

test("does not join across blank line", () => {
  const result = unwrap(book(["end of para", "", "start of next"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("end of para");
});
