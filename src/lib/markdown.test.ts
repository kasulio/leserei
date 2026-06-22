import { expect, test } from "bun:test";

import { isSceneBreakLine } from "./markdown";

test("isSceneBreakLine recognises escaped asterisk dividers", () => {
  expect(isSceneBreakLine("\\* \\* \\*")).toBe(true);
  expect(isSceneBreakLine("\\* \\* \\* \\*")).toBe(true);
});

test("isSceneBreakLine rejects prose-like lines", () => {
  expect(isSceneBreakLine("She paused...")).toBe(false);
  expect(isSceneBreakLine("* one star")).toBe(false);
});
