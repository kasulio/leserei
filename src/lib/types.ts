export type OutputFormat = "plain" | "markdown";

export interface Chapter {
  title: string;
  lines: string[];
}

export interface Book {
  title: string;
  chapters: Chapter[];
}

export interface Options {
  normalize: boolean;
  italicCleanup: boolean;
  dehyphenate: boolean;
  unwrap: boolean;
  stripInvisible: boolean;
  standardizeSceneBreaks: boolean;
  removeFrontMatter: boolean;
  /** Max consecutive blank lines per chapter (normalize step). */
  maxBlankLines: number;
}

export type StepId = Exclude<keyof Options, "maxBlankLines">;

export type TransformStep = (book: Book, opts: Options) => Book;
