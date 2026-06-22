import type { StepId } from "./types";

export interface StepUi {
  id: StepId;
  label: string;
  description: string;
}

export const STEP_UI: StepUi[] = [
  {
    id: "normalize",
    label: "Fix punctuation & spacing",
    description: "Smart quotes, dashes, whitespace, and scene dividers",
  },
  {
    id: "stripInvisible",
    label: "Remove invisible characters",
    description: "Soft hyphens and zero-width formatting characters",
  },
  {
    id: "italicCleanup",
    label: "Fix emphasis spacing",
    description: "Tidy spacing inside bold and italic markers",
  },
  {
    id: "dehyphenate",
    label: "Fix hyphenated line breaks",
    description: "Rejoin words split across lines",
  },
  {
    id: "unwrap",
    label: "Join wrapped lines",
    description: "Merge soft-wrapped lines into paragraphs",
  },
  {
    id: "removeFrontMatter",
    label: "Skip nav & front matter",
    description: "Omit TOC, cover, copyright, and other non-body files",
  },
];
