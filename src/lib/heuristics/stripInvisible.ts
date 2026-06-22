import { mapDocText } from "../docTransforms";
import type { TransformStep } from "../types";

/** Soft hyphens and invisible formatting characters not covered elsewhere. */
const INVISIBLE_CHARS = /[\u00AD\uFEFF\u200B-\u200F\u2060\u2061-\u2064]/g;

export const stripInvisible: TransformStep = (doc) =>
  mapDocText(doc, (text) => text.replace(INVISIBLE_CHARS, ""));
