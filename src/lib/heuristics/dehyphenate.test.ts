import { expect, test } from "bun:test";

import { dehyphenate } from "./dehyphenate";
import { opts, paragraphs, render } from "./testUtils";

test("joins hyphenated word split across paragraphs", () => {
  const result = dehyphenate(paragraphs(["exam-", "ple text."]), opts);
  expect(render(result)).toBe("example text.");
});

test("does not join when next fragment starts uppercase", () => {
  const result = dehyphenate(paragraphs(["Some-", "Thing"]), opts);
  expect(render(result)).toBe("Some-\n\nThing");
});

test("does not join real end-of-sentence hyphen", () => {
  const result = dehyphenate(paragraphs(["self-", "The next sentence."]), opts);
  expect(render(result)).toBe("self-\n\nThe next sentence.");
});

test("handles multi-word lines correctly", () => {
  const result = dehyphenate(
    paragraphs(["This is extra-", "ordinary indeed."]),
    opts,
  );
  expect(render(result)).toBe("This is extraordinary indeed.");
});

test("preserves emphasis when joining hyphenated paragraphs", () => {
  const result = dehyphenate(
    {
      title: "",
      chapters: [
        {
          title: "",
          blocks: [
            {
              t: "para",
              inline: [
                { t: "text", value: "This is " },
                { t: "emph", children: [{ t: "text", value: "extra-" }] },
              ],
            },
            {
              t: "para",
              inline: [{ t: "text", value: "ordinary indeed." }],
            },
          ],
        },
      ],
    },
    opts,
  );

  expect(render(result)).toBe("This is *extra*ordinary indeed.");
});

test("leaves non-hyphenated lines untouched", () => {
  const result = dehyphenate(
    paragraphs(["Normal line.", "Another line."]),
    opts,
  );
  expect(render(result)).toBe("Normal line.\n\nAnother line.");
});
