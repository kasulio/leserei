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
}

export type StepId = keyof Options;

export type TransformStep = (book: Book, opts: Options) => Book;
