import { expect, test } from "bun:test";

import { unescapeMarkdownProse } from "../markdown";
import { defaultOptions, runPipeline } from "../pipeline";
import type { Book } from "../types";

test("unescapeMarkdownProse strips escapes before ! and parens", () => {
  expect(unescapeMarkdownProse("Wow\\! Really\\?")).toBe("Wow! Really\\?");
  expect(unescapeMarkdownProse("Note \\(aside\\) here")).toBe(
    "Note (aside) here",
  );
  expect(unescapeMarkdownProse("Keep \\*emphasis\\*")).toBe("Keep *emphasis*");
  expect(unescapeMarkdownProse("2\\+2 equals 4")).toBe("2+2 equals 4");
});

test("runPipeline unescapes markdown prose as final step", () => {
  const book: Book = {
    title: "",
    chapters: [{ title: "", lines: ["She laughed\\! \\(quietly\\)"] }],
  };
  const result = runPipeline(book, defaultOptions(), "markdown");
  expect(result.chapters[0]!.lines[0]).toBe("She laughed! (quietly)");
});

test("runPipeline skips unescape for plain format", () => {
  const book: Book = {
    title: "",
    chapters: [{ title: "", lines: ["She laughed\\! \\(quietly\\)"] }],
  };
  const result = runPipeline(book, defaultOptions(), "plain");
  expect(result.chapters[0]!.lines[0]).toBe("She laughed\\! \\(quietly\\)");
});
