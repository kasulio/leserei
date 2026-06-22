import { expect, test } from "bun:test";

import type { SpineItem } from "./epub";
import { extractBook } from "./extract";
import { bookToText, runPipeline } from "./pipeline";
import { PRESETS } from "./presets";

function spine(html: string, overrides: Partial<SpineItem> = {}): SpineItem[] {
  return [
    {
      href: "ch1.xhtml",
      content: html,
      linear: true,
      properties: [],
      ...overrides,
    },
  ];
}

test("markdown: headings, emphasis, scene break", () => {
  const book = extractBook(
    spine(`<html><body>
      <h1>Chapter One</h1>
      <p>She said <em>hello</em> and <strong>goodbye</strong>.</p>
      <hr/>
      <p>Next scene.</p>
    </body></html>`),
    "Test",
    "markdown",
  );

  expect(book.chapters[0]!.lines).toEqual([
    "# Chapter One",
    "",
    "She said *hello* and **goodbye**.",
    "",
    "* * *",
    "",
    "Next scene.",
  ]);
});

test("markdown: unordered list", () => {
  const book = extractBook(
    spine(`<html><body><ul><li>One</li><li>Two</li></ul></body></html>`),
    "",
    "markdown",
  );

  expect(book.chapters[0]!.lines).toEqual(["+ One", "", "+ Two"]);
});

test("markdown: external link", () => {
  const book = extractBook(
    spine(
      `<html><body><p>See <a href="https://example.com">here</a>.</p></body></html>`,
    ),
    "",
    "markdown",
  );

  expect(book.chapters[0]!.lines[0]!).toBe("See [here](https://example.com).");
});

test("markdown: omits images", () => {
  const book = extractBook(
    spine(`<html><body>
      <p>Before <img src="pic.png" alt="diagram"/> after.</p>
      <p><img src="solo.png" alt="solo"/></p>
      <figure><img src="fig.png"/><figcaption>Caption</figcaption></figure>
    </body></html>`),
    "",
    "markdown",
  );

  expect(book.chapters[0]!.lines).toEqual(["Before  after.", "", "Caption"]);
});

test("markdown: headings inside div keep level", () => {
  const book = extractBook(
    spine(`<html><body>
      <div>
        <h2>Section</h2>
        <p>Body text.</p>
      </div>
    </body></html>`),
    "",
    "markdown",
  );

  expect(book.chapters[0]!.lines).toEqual(["## Section", "", "Body text."]);
});

test("markdown: h1-h6 map to correct hash count", () => {
  const book = extractBook(
    spine(`<html><body>
      <h1>L1</h1><h2>L2</h2><h3>L3</h3><h4>L4</h4><h5>L5</h5><h6>L6</h6>
    </body></html>`),
    "",
    "markdown",
  );

  expect(book.chapters[0]!.lines).toEqual([
    "# L1",
    "",
    "## L2",
    "",
    "### L3",
    "",
    "#### L4",
    "",
    "##### L5",
    "",
    "###### L6",
  ]);
});

test("markdown: p with br keeps inline text", () => {
  const book = extractBook(
    spine(
      `<html><body><p>Line1<br/>Line2</p><p>Para A</p><p>Para B</p></body></html>`,
    ),
    "",
    "markdown",
  );

  expect(book.chapters[0]!.lines).toEqual([
    "Line1  \nLine2",
    "",
    "Para A",
    "",
    "Para B",
  ]);
});

test("plain: p with br keeps line breaks", () => {
  const book = extractBook(
    spine(`<html><body><p>Line1<br/>Line2</p></body></html>`),
    "",
    "plain",
  );

  expect(book.chapters[0]!.lines[0]!).toBe("Line1\nLine2");
});

test("markdown: p with br keeps inline text", () => {
  const book = extractBook(
    spine(
      `<html><body><p>Line1<br/>Line2</p><p>Para A</p><p>Para B</p></body></html>`,
    ),
    "",
    "markdown",
  );

  expect(book.chapters[0]!.lines).toEqual([
    "Line1  \nLine2",
    "",
    "Para A",
    "",
    "Para B",
  ]);
});

test("plain: p with br keeps line breaks", () => {
  const book = extractBook(
    spine(`<html><body><p>Line1<br/>Line2</p></body></html>`),
    "",
    "plain",
  );

  expect(book.chapters[0]!.lines[0]!).toBe("Line1\nLine2");
});

test("plain: strips formatting", () => {
  const book = extractBook(
    spine(`<html><body><p><em>italic</em> text</p></body></html>`),
    "",
    "plain",
  );

  expect(book.chapters[0]!.lines[0]!).toBe("italic text");
});

test("plain: bookToText does not duplicate heading", () => {
  const book = extractBook(
    spine(
      `<html><body><h1>Chapter One</h1><p>First para.</p><p>Second para.</p></body></html>`,
    ),
    "",
    "plain",
  );

  const text = bookToText(book, "plain");
  expect(text.match(/Chapter One/g)?.length).toBe(1);
  expect(text).toBe("Chapter One\n\nFirst para.\n\nSecond para.");
});

test("markdown: soft-wrapped p tags omit blank gap", () => {
  const book = extractBook(
    spine(
      `<html><body><p>The quick brown fox</p><p>jumps over the lazy dog.</p></body></html>`,
    ),
    "",
    "markdown",
  );

  expect(book.chapters[0]!.lines).toEqual([
    "The quick brown fox",
    "jumps over the lazy dog.",
  ]);
});

test("processed preset unwraps soft-wrapped paragraphs", () => {
  const book = extractBook(
    spine(
      `<html><body><p>The quick brown fox</p><p>jumps over the lazy dog.</p><p>Second paragraph.</p><p>Third starts here.</p></body></html>`,
    ),
    "",
    "markdown",
  );

  const result = runPipeline(
    book,
    PRESETS.find((p) => p.id === "processed")!.options,
  );
  expect(result.chapters[0]!.lines).toEqual([
    "The quick brown fox jumps over the lazy dog.",
    "",
    "Second paragraph.",
    "",
    "Third starts here.",
  ]);
  expect(bookToText(result, "markdown")).toBe(
    "The quick brown fox jumps over the lazy dog.\n\nSecond paragraph.\n\nThird starts here.",
  );
});

test("processed preset preserves scene break text", () => {
  const book = extractBook(
    spine(`<html><body><p>* * *</p></body></html>`),
    "",
    "markdown",
  );

  const result = runPipeline(
    book,
    PRESETS.find((p) => p.id === "processed")!.options,
    "markdown",
  );
  expect(result.chapters[0]!.lines[0]!).toBe("* * *");
});
