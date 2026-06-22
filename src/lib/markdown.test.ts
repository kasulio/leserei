import { expect, test } from "bun:test";

import {
  headingPrefix,
  isListItemLine,
  isSceneBreakLine,
  needsParagraphGap,
} from "./markdown";

test("isSceneBreakLine recognises escaped asterisk dividers", () => {
  expect(isSceneBreakLine("\\* \\* \\*")).toBe(true);
  expect(isSceneBreakLine("\\* \\* \\* \\*")).toBe(true);
});

test("headingPrefix returns correct hashes", () => {
  expect(headingPrefix(1)).toBe("# ");
  expect(headingPrefix(3)).toBe("### ");
});

test("isListItemLine recognises markdown list markers", () => {
  expect(isListItemLine("+ item")).toBe(true);
  expect(isListItemLine("1. item")).toBe(true);
  expect(isListItemLine("\t+ nested")).toBe(true);
  expect(isListItemLine("> + quoted")).toBe(true);
  expect(isListItemLine("plain prose")).toBe(false);
});

test("needsParagraphGap skips consecutive list items", () => {
  expect(needsParagraphGap("+ one.", "+ two.")).toBe(false);
  expect(needsParagraphGap("+ one.", "Next para.")).toBe(true);
});
