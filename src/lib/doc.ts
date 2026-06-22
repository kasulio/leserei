export type Inline =
  | { t: "text"; value: string }
  | { t: "emph"; children: Inline[] }
  | { t: "strong"; children: Inline[] }
  | { t: "code"; value: string }
  | { t: "link"; href: string; title?: string; children: Inline[] }
  | { t: "break" };

export type Block =
  | { t: "heading"; level: number; inline: Inline[] }
  | { t: "para"; inline: Inline[] }
  | { t: "sceneBreak" }
  | { t: "list"; ordered: boolean; items: ListItem[] }
  | { t: "quote"; children: Block[] }
  | { t: "codeBlock"; value: string };

export interface ListItem {
  children: Block[];
}

export interface DocChapter {
  title: string;
  blocks: Block[];
}

export interface Doc {
  title: string;
  chapters: DocChapter[];
}
