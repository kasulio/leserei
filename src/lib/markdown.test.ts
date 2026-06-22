import { expect, test } from "bun:test";

import { escapeMarkdown, headingPrefix } from "./markdown";

test("escapeMarkdown escapes special chars", () => {
  expect(escapeMarkdown("a * b")).toBe("a \\* b");
  expect(escapeMarkdown("[link](url)")).toBe("\\[link\\]\\(url\\)");
});

test("headingPrefix returns correct hashes", () => {
  expect(headingPrefix(1)).toBe("# ");
  expect(headingPrefix(3)).toBe("### ");
});
