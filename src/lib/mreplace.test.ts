import { expect, test } from "bun:test";

import { mreplace } from "./mreplace";

test("replaces longer keys before shorter overlapping ones", () => {
  const replace = mreplace({ ab: "X", a: "Y" });
  expect(replace("ab")).toBe("X");
});

test("applies all entries", () => {
  const replace = mreplace({ foo: "bar", baz: "qux" });
  expect(replace("foo and baz")).toBe("bar and qux");
});
