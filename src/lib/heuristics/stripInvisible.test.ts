import { expect, test } from "bun:test";

import { stripInvisible } from "./stripInvisible";
import { opts, paragraphs, render } from "./testUtils";

test("removes soft hyphens", () => {
  expect(render(stripInvisible(paragraphs(["hy\u00ADphen"]), opts))).toBe(
    "hyphen",
  );
});

test("removes zero-width space", () => {
  expect(render(stripInvisible(paragraphs(["hel\u200Blo"]), opts))).toBe(
    "hello",
  );
});

test("removes byte-order mark", () => {
  expect(render(stripInvisible(paragraphs(["\uFEFFStart"]), opts))).toBe(
    "Start",
  );
});

test("leaves visible punctuation", () => {
  expect(render(stripInvisible(paragraphs(["hello—world"]), opts))).toBe(
    "hello—world",
  );
});
