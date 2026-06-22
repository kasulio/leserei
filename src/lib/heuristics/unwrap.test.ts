import { expect, test } from "bun:test";

import { opts, paragraphs, render } from "./testUtils";
import { unwrap } from "./unwrap";

test("joins soft-wrapped paragraph when next starts lowercase", () => {
  const result = unwrap(
    paragraphs(["The quick brown fox", "jumps over the lazy dog."]),
    opts,
  );
  expect(render(result)).toBe("The quick brown fox jumps over the lazy dog.");
});

test("does not join when current paragraph ends with period", () => {
  const result = unwrap(
    paragraphs(["First sentence.", "Second sentence."]),
    opts,
  );
  expect(render(result)).toBe("First sentence.\n\nSecond sentence.");
});

test("does not join when next paragraph starts uppercase", () => {
  const result = unwrap(paragraphs(["One line", "Another line"]), opts);
  expect(render(result)).toBe("One line\n\nAnother line");
});

test("preserves emphasis when joining soft-wrapped paragraphs", () => {
  const result = unwrap(
    {
      title: "",
      chapters: [
        {
          title: "",
          blocks: [
            {
              t: "para",
              inline: [
                { t: "text", value: "The " },
                { t: "emph", children: [{ t: "text", value: "quick" }] },
                { t: "text", value: " brown fox" },
              ],
            },
            {
              t: "para",
              inline: [{ t: "text", value: "jumps over the lazy dog." }],
            },
          ],
        },
      ],
    },
    opts,
  );

  expect(render(result)).toBe("The *quick* brown fox jumps over the lazy dog.");
});

test("does not join across structural block", () => {
  const result = unwrap(
    {
      title: "",
      chapters: [
        {
          title: "",
          blocks: [
            { t: "para", inline: [{ t: "text", value: "end of para" }] },
            { t: "sceneBreak" },
            { t: "para", inline: [{ t: "text", value: "start of next" }] },
          ],
        },
      ],
    },
    opts,
  );
  expect(render(result)).toBe("end of para\n\n* * *\n\nstart of next");
});
