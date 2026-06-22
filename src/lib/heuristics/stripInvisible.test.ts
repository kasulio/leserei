import { expect, test } from "bun:test";

import type { Book, Options } from "../types";
import { stripInvisible } from "./stripInvisible";

function book(lines: string[]): Book {
  return { title: "", chapters: [{ title: "", lines }] };
}

const opts = {} as Options;

test("removes soft hyphens", () => {
  const result = stripInvisible(book(["hy\u00ADphen"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("hyphen");
});

test("removes zero-width space", () => {
  const result = stripInvisible(book(["hel\u200Blo"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("hello");
});

test("removes byte-order mark", () => {
  const result = stripInvisible(book(["\uFEFFStart"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("Start");
});

test("leaves visible punctuation", () => {
  const result = stripInvisible(book(["hello—world"]), opts);
  expect(result.chapters[0]!.lines[0]!).toBe("hello—world");
});
