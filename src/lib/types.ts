import type { Doc } from "./doc";

export type OutputFormat = "plain" | "markdown";

export interface Options {
  normalize: boolean;
  italicCleanup: boolean;
  dehyphenate: boolean;
  unwrap: boolean;
  stripInvisible: boolean;
  standardizeSceneBreaks: boolean;
  removeFrontMatter: boolean;
  /** Max visible blank lines in serialized output. */
  maxBlankLines: number;
}

export type StepId = Exclude<keyof Options, "maxBlankLines">;

export type TransformStep = (doc: Doc, opts: Options) => Doc;
