import type { Options } from "./types";

export interface Preset {
  id: string;
  label: string;
  description: string;
  options: Options;
}

const LIGHT: Options = {
  normalize: true,
  italicCleanup: false,
  dehyphenate: false,
  unwrap: false,
};

const READING: Options = {
  normalize: true,
  italicCleanup: false,
  dehyphenate: true,
  unwrap: true,
};

const FULL: Options = {
  normalize: true,
  italicCleanup: true,
  dehyphenate: true,
  unwrap: true,
};

export const PRESETS: Preset[] = [
  {
    id: "default",
    label: "Light cleanup",
    description: "Punctuation and spacing only",
    options: LIGHT,
  },
  {
    id: "reading",
    label: "Reading format",
    description: "Also unwraps paragraphs and fixes hyphenation",
    options: READING,
  },
  {
    id: "processed",
    label: "Full cleanup",
    description: "All cleanup options enabled",
    options: FULL,
  },
  {
    id: "custom",
    label: "Custom",
    description: "Choose individual cleanup options",
    options: LIGHT,
  },
];
