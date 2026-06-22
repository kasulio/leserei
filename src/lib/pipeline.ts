import type { Doc } from "./doc";
import { dehyphenate } from "./heuristics/dehyphenate";
import { italicCleanup } from "./heuristics/italicCleanup";
import { normalize } from "./heuristics/normalize";
import { standardizeSceneBreaks } from "./heuristics/standardizeSceneBreaks";
import { stripInvisible } from "./heuristics/stripInvisible";
import { unwrap } from "./heuristics/unwrap";
import { PRESETS } from "./presets";
import type { Options, TransformStep } from "./types";

const PIPELINE: Array<{
  id: keyof Omit<Options, "maxBlankLines" | "removeFrontMatter">;
  fn: TransformStep;
}> = [
  { id: "normalize", fn: normalize },
  { id: "stripInvisible", fn: stripInvisible },
  { id: "standardizeSceneBreaks", fn: standardizeSceneBreaks },
  { id: "italicCleanup", fn: italicCleanup },
  { id: "dehyphenate", fn: dehyphenate },
  { id: "unwrap", fn: unwrap },
];

export function defaultOptions(): Options {
  return { ...PRESETS.find((p) => p.id === "reading")!.options };
}

export function runPipeline(doc: Doc, opts: Options): Doc {
  let current = structuredClone(doc);
  for (const step of PIPELINE) {
    if (!opts[step.id]) continue;
    current = step.fn(current, opts);
  }
  return current;
}
