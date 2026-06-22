import { mapDocText } from "../docTransforms";
import { mreplace } from "../mreplace";
import type { TransformStep } from "../types";

export const DEFAULT_MAX_BLANK_LINES = 2;

// Calibre-compatible set (entities + Unicode literals).
const CALIBRE: Record<string, string> = {
  "&mdash;": "---",
  "&#8212;": "---",
  "\u2014": "---",
  "&ndash;": "--",
  "&#8211;": "--",
  "\u2013": "--",
  "&hellip;": "...",
  "&#8230;": "...",
  "\u2026": "...",
  "&ldquo;": '"',
  "&rdquo;": '"',
  "&bdquo;": '"',
  "&Prime;": '"',
  "&#8220;": '"',
  "&#8221;": '"',
  "&#8222;": '"',
  "&#8243;": '"',
  "\u201C": '"',
  "\u201D": '"',
  "\u201E": '"',
  "\u2033": '"',
  "&lsquo;": "'",
  "&rsquo;": "'",
  "&prime;": "'",
  "&#8216;": "'",
  "&#8217;": "'",
  "&#8242;": "'",
  "\u2018": "'",
  "\u2019": "'",
  "\u2032": "'",
};

const EXTENSIONS: Record<string, string> = {
  "\u00AB": '"',
  "\u00BB": '"',
  "\u2039": "'",
  "\u203A": "'",
  "\u201F": '"',
  "\u201A": "'",
  "\u201B": "'",
  "\u02BC": "'",
  "\u02BB": "'",
  "\uFF02": '"',
  "\uFF07": "'",
  "\u2E3B": "---------",
  "\u2E3A": "------",
  "\u2015": "---",
  "\u2012": "-",
  "\u2010": "-",
  "\u2011": "-",
  "\u2212": "-",
  "\uFF0D": "-",
  "\u22EF": "...",
  "\u2025": "..",
  "\u2024": ".",
  "\u00A0": " ",
  "\u202F": " ",
  "\u2000": " ",
  "\u2001": " ",
  "\u2002": " ",
  "\u2003": " ",
  "\u2004": " ",
  "\u2005": " ",
  "\u2006": " ",
  "\u2007": " ",
  "\u2008": " ",
  "\u2009": " ",
  "\u200A": " ",
  "\u205F": " ",
  "\u3000": " ",
  "\uFEFF": "",
  "\u200B": "",
  "\u200C": "",
  "\u200D": "",
  "\u2022": "*",
  "\u2023": "*",
  "\u2043": "*",
  "\u2219": "*",
  "\u2036": '"',
  "\u2035": "'",
  "\uFF01": "!",
  "\uFF0C": ",",
  "\uFF0E": ".",
  "\uFF1A": ":",
  "\uFF1B": ";",
  "\uFF1F": "?",
};

const HEX_ENTITIES =
  /&#x(2013|2014|2026|2018|2019|201a|201c|201d|201e|2032|2033);/gi;

const HEX_ENTITY_MAP: Record<string, string> = {
  "2013": "--",
  "2014": "---",
  "2026": "...",
  "2018": "'",
  "2019": "'",
  "201a": "'",
  "201c": '"',
  "201d": '"',
  "201e": '"',
  "2032": "'",
  "2033": '"',
};

const unsmartenText = mreplace({ ...CALIBRE, ...EXTENSIONS });

function normalizeText(text: string): string {
  const unsmartened = unsmartenText(text);
  const decoded = unsmartened.replace(
    HEX_ENTITIES,
    (match, hex) => HEX_ENTITY_MAP[hex.toLowerCase()] ?? match,
  );
  return decoded.replace(/ {2,}/g, " ");
}

export const normalize: TransformStep = (doc) => mapDocText(doc, normalizeText);
