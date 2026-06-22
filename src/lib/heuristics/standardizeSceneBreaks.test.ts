import { expect, test } from "bun:test";

import type { Book, Options } from "../types";
import {
  isSceneBreakLine,
  SCENE_BREAK,
  standardizeSceneBreaks,
} from "./standardizeSceneBreaks";

function book(lines: string[]): Book {
  return { title: "", chapters: [{ title: "", lines }] };
}

const opts = {} as Options;

test("isSceneBreakLine recognises common dividers", () => {
  for (const line of [
    "* * *",
    "***",
    "* * * *",
    "*  *  *",
    "*  *  *  *",
    "****",
    "---",
    "- - -",
    "___",
    "###",
    "# # #",
    "...",
    "······",
    "· · ·",
    "• • •",
    "\\* \\* \\*",
  ]) {
    expect(isSceneBreakLine(line)).toBe(true);
  }
});

test("isSceneBreakLine rejects prose-like lines", () => {
  for (const line of [
    "She paused...",
    "—",
    "--",
    "**bold**",
    "The end.",
    "* one star",
  ]) {
    expect(isSceneBreakLine(line)).toBe(false);
  }
});

test("normalises asterisk variants", () => {
  const result = standardizeSceneBreaks(
    book(["***", "text", "*  *  *", "* * * *"]),
    opts,
  );
  expect(result.chapters[0]!.lines).toEqual([
    SCENE_BREAK,
    "text",
    SCENE_BREAK,
    SCENE_BREAK,
  ]);
});

test("normalises four escaped asterisks", () => {
  const result = standardizeSceneBreaks(book([String.raw`\* \* \* \*`]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe(SCENE_BREAK);
});

test("normalises dash and ellipsis dividers", () => {
  const result = standardizeSceneBreaks(book(["---", "...", "-----"]), opts);
  expect(result.chapters[0]!.lines).toEqual([
    SCENE_BREAK,
    SCENE_BREAK,
    SCENE_BREAK,
  ]);
});

test("normalises escaped markdown dividers", () => {
  const result = standardizeSceneBreaks(book(["\\* \\* \\*"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe(SCENE_BREAK);
});

test("leaves non-divider lines unchanged", () => {
  const lines = ["Chapter opener.", "She looked away..."];
  const result = standardizeSceneBreaks(book(lines), opts);
  expect(result.chapters[0]!.lines).toEqual(lines);
});
