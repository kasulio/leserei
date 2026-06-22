import { expect, test } from "bun:test";

import {
  escapeMarkdown,
  headingPrefix,
  isListItemLine,
  needsParagraphGap,
} from "./markdown";

test("escapeMarkdown escapes special chars", () => {
  expect(escapeMarkdown("a * b")).toBe("a \\* b");
  expect(escapeMarkdown("[link](url)")).toBe("\\[link\\]\\(url\\)");
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
