export function parseHtmlDocument(source: string): Document {
  const doc = new DOMParser().parseFromString(source, "application/xhtml+xml");
  if (!doc.querySelector("parsererror")) return doc;
  return new DOMParser().parseFromString(source, "text/html");
}

export function documentBody(doc: Document): Element {
  return doc.querySelector("body") ?? doc.documentElement;
}
