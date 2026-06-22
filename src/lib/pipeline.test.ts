import { expect, test } from "bun:test";

import { bookToText, collapseExcessNewlines } from "./pipeline";
import type { Book, Options } from "./types";

const markdownBook: Book = {
  title: "T",
  chapters: [
    { title: "One", lines: ["# One", "Para"] },
    { title: "Two", lines: ["# Two", "More"] },
  ],
};

const plainBook: Book = {
  title: "T",
  chapters: [
    { title: "One", lines: ["One", "Para"] },
    { title: "Two", lines: ["Two", "More"] },
  ],
};

test("bookToText markdown joins chapters with extra blank lines", () => {
  expect(bookToText(markdownBook, "markdown")).toBe(
    "# One\n\nPara\n\n\n# Two\n\nMore",
  );
});

test("bookToText markdown uses paragraph breaks between content lines", () => {
  const b: Book = {
    title: "",
    chapters: [{ title: "", lines: ["Para A", "Para B"] }],
  };
  expect(bookToText(b, "markdown")).toBe("Para A\n\nPara B");
});

test("bookToText markdown adds extra blank lines from consecutive empties", () => {
  const b: Book = {
    title: "",
    chapters: [{ title: "", lines: ["Para A", "", "", "Para B"] }],
  };
  expect(bookToText(b, "markdown")).toBe("Para A\n\n\nPara B");
});

test("bookToText plain uses paragraph breaks and chapter separator", () => {
  expect(bookToText(plainBook, "plain")).toBe(
    "One\n\nPara\n\n\n* * *\n\n\nTwo\n\nMore",
  );
});

test("bookToText plain adds extra blank lines from consecutive empties", () => {
  const b: Book = {
    title: "",
    chapters: [{ title: "", lines: ["Para A", "", "", "Para B"] }],
  };
  expect(bookToText(b, "plain")).toBe("Para A\n\n\nPara B");
});

test("collapseExcessNewlines caps visible blank lines", () => {
  expect(collapseExcessNewlines("a\n\n\n\nb", 1)).toBe("a\n\nb");
  expect(collapseExcessNewlines("a\n\n\n\nb", 2)).toBe("a\n\n\n\nb");
});

test("bookToText applies maxBlankLines when normalize is on", () => {
  const b: Book = {
    title: "",
    chapters: [{ title: "", lines: ["Para A", "", "", "Para B"] }],
  };
  const opts = { normalize: true, maxBlankLines: 1 } as Options;
  expect(bookToText(b, "markdown", opts)).toBe("Para A\n\nPara B");
});
