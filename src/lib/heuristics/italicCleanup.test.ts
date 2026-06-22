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

test("spaces emphasis after glued word", () => {
  const result = italicCleanup(book(["and* what Kings.*"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("and *what Kings.*");
});

test("spaces emphasis before glued word", () => {
  const result = italicCleanup(book(["*hello*world"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("*hello* world");
});

test("spaces glued bold", () => {
  const result = italicCleanup(book(["say** loud **now"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("say **loud** now");
});

test("skips apostrophe contractions", () => {
  const result = italicCleanup(book(["don't*word*"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("don't*word*");
});

test("keeps punctuation glued after closing emphasis", () => {
  const result = italicCleanup(book(["*word*. Next *word*, rest"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("*word*. Next *word*, rest");
});

test("spaces multiple glued spans on one line", () => {
  const result = italicCleanup(book(["a*one*and**two**b"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("a *one* and **two** b");
});

test("spaces emphasis after glued punctuation", () => {
  const result = italicCleanup(book(['She paused.* "Hello there!*']), opts);
  expect(result.chapters[0]!.lines[0]!).toBe('She paused. *"Hello there!*');
});
