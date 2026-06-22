import { expect, test } from "bun:test";

import {
  isSceneBreakLine,
  SCENE_BREAK,
  standardizeSceneBreaks,
} from "./standardizeSceneBreaks";
import { opts, paragraphs, render } from "./testUtils";

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

test("normalises asterisk variants to scene break blocks", () => {
  const result = standardizeSceneBreaks(
    paragraphs(["***", "text", "*  *  *", "* * * *"]),
    opts,
  );
  expect(render(result)).toBe(
    `${SCENE_BREAK}\n\ntext\n\n${SCENE_BREAK}\n\n${SCENE_BREAK}`,
  );
});

test("normalises four escaped asterisks", () => {
  const result = standardizeSceneBreaks(
    paragraphs([String.raw`\* \* \* \*`]),
    opts,
  );
  expect(render(result)).toBe(SCENE_BREAK);
});

test("normalises dash and ellipsis dividers", () => {
  const result = standardizeSceneBreaks(
    paragraphs(["---", "...", "-----"]),
    opts,
  );
  expect(render(result)).toBe(
    `${SCENE_BREAK}\n\n${SCENE_BREAK}\n\n${SCENE_BREAK}`,
  );
});

test("leaves non-divider paragraphs unchanged", () => {
  const result = standardizeSceneBreaks(
    paragraphs(["Chapter opener.", "She looked away..."]),
    opts,
  );
  expect(render(result)).toBe("Chapter opener.\n\nShe looked away...");
});
