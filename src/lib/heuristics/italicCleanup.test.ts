import { expect, test } from "bun:test";

import type { Inline } from "../doc";
import { italicCleanup } from "./italicCleanup";
import { doc, opts, render } from "./testUtils";

function para(inline: Inline[]) {
  return doc([{ t: "para", inline }]);
}

test("trims spaces inside italic emphasis", () => {
  const result = italicCleanup(
    para([
      { t: "text", value: "It was " },
      { t: "emph", children: [{ t: "text", value: " very " }] },
      { t: "text", value: " odd." },
    ]),
    opts,
  );
  expect(render(result)).toBe("It was *very* odd.");
});

test("trims spaces inside bold emphasis", () => {
  const result = italicCleanup(
    para([
      { t: "strong", children: [{ t: "text", value: " loud " }] },
      { t: "text", value: " noise" },
    ]),
    opts,
  );
  expect(render(result)).toBe("**loud** noise");
});

test("leaves clean emphasis unchanged", () => {
  const result = italicCleanup(
    para([
      { t: "text", value: "Already " },
      { t: "emph", children: [{ t: "text", value: "fine" }] },
      { t: "text", value: " here." },
    ]),
    opts,
  );
  expect(render(result)).toBe("Already *fine* here.");
});

test("spaces emphasis after glued word", () => {
  const result = italicCleanup(
    para([
      { t: "text", value: "and" },
      { t: "emph", children: [{ t: "text", value: " what Kings." }] },
    ]),
    opts,
  );
  expect(render(result)).toBe("and *what Kings.*");
});

test("spaces emphasis before glued word", () => {
  const result = italicCleanup(
    para([
      { t: "emph", children: [{ t: "text", value: "hello" }] },
      { t: "text", value: "world" },
    ]),
    opts,
  );
  expect(render(result)).toBe("*hello* world");
});

test("spaces glued bold", () => {
  const result = italicCleanup(
    para([
      { t: "text", value: "say" },
      { t: "strong", children: [{ t: "text", value: " loud " }] },
      { t: "text", value: "now" },
    ]),
    opts,
  );
  expect(render(result)).toBe("say **loud** now");
});

test("skips apostrophe contractions", () => {
  const result = italicCleanup(
    para([
      { t: "text", value: "don't" },
      { t: "emph", children: [{ t: "text", value: "word" }] },
    ]),
    opts,
  );
  expect(render(result)).toBe("don't*word*");
});

test("keeps punctuation glued after closing emphasis", () => {
  const result = italicCleanup(
    para([
      { t: "emph", children: [{ t: "text", value: "word" }] },
      { t: "text", value: ". Next " },
      { t: "emph", children: [{ t: "text", value: "word" }] },
      { t: "text", value: ", rest" },
    ]),
    opts,
  );
  expect(render(result)).toBe("*word*. Next *word*, rest");
});

test("spaces emphasis after glued punctuation", () => {
  const result = italicCleanup(
    para([
      { t: "text", value: "She paused." },
      { t: "emph", children: [{ t: "text", value: ' "Hello there!' }] },
    ]),
    opts,
  );
  expect(render(result)).toBe('She paused. *"Hello there!*');
});
