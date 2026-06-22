import { expect, test } from "bun:test";

import type { Book, Options } from "../types";
import { italicCleanup } from "./italicCleanup";

function book(lines: string[]): Book {
  return { title: "", chapters: [{ title: "", lines }] };
}

const opts = {} as Options;

test("trims spaces inside italic emphasis", () => {
  const result = italicCleanup(book(["It was * very * odd."]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("It was *very* odd.");
});

test("trims spaces inside bold emphasis", () => {
  const result = italicCleanup(book(["** loud ** noise"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("**loud** noise");
});

test("fixes asymmetric italic spacing", () => {
  const result = italicCleanup(book(["*word * and * word*"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("*word* and *word*");
});

test("preserves scene break marker", () => {
  const result = italicCleanup(book(["* * *"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("* * *");
});

test("preserves escaped scene break from extraction", () => {
  const result = italicCleanup(book(["\\* \\* \\*"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("\\* \\* \\*");
});

test("leaves clean emphasis unchanged", () => {
  const result = italicCleanup(book(["Already *fine* here."]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("Already *fine* here.");
});
