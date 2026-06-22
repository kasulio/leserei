import JSZip from "jszip";

export interface SpineItem {
  href: string; // path relative to OPF directory
  content: string; // raw XHTML string
}

export async function loadEpub(file: File): Promise<SpineItem[]> {
  const buf = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  // 1. Find OPF path from META-INF/container.xml
  const containerXml = await requireEntry(zip, "META-INF/container.xml");
  const opfPath = parseOpfPath(containerXml);
  const opfDir = opfPath.includes("/")
    ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1)
    : "";

  // 2. Parse OPF — manifest + spine
  const opfXml = await requireEntry(zip, opfPath);
  const hrefs = parseSpineHrefs(opfXml, opfDir);

  // 3. Load each spine item
  const items: SpineItem[] = [];
  for (const href of hrefs) {
    const entry = zip.file(href) ?? zip.file(decodeURIComponent(href));
    if (!entry) continue;
    const content = await entry.async("string");
    items.push({ href, content });
  }
  return items;
}

async function requireEntry(zip: JSZip, path: string): Promise<string> {
  const entry = zip.file(path);
  if (!entry) throw new Error(`EPUB missing: ${path}`);
  return entry.async("string");
}

function parseOpfPath(containerXml: string): string {
  const doc = new DOMParser().parseFromString(containerXml, "application/xml");
  const rootfile = doc.querySelector("rootfile");
  const path = rootfile?.getAttribute("full-path");
  if (!path) throw new Error("container.xml: no rootfile full-path");
  return path;
}

function parseSpineHrefs(opfXml: string, opfDir: string): string[] {
  const doc = new DOMParser().parseFromString(opfXml, "application/xml");

  // Build id -> href map from manifest
  const manifestMap = new Map<string, string>();
  doc.querySelectorAll("manifest item").forEach((item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    const mt = item.getAttribute("media-type") ?? "";
    if (
      id &&
      href &&
      (mt.includes("xhtml") || mt.includes("html") || href.match(/\.x?html?$/i))
    ) {
      manifestMap.set(id, opfDir + href);
    }
  });

  // Ordered spine
  const hrefs: string[] = [];
  doc.querySelectorAll("spine itemref").forEach((ref) => {
    const idref = ref.getAttribute("idref");
    if (idref && manifestMap.has(idref)) {
      hrefs.push(manifestMap.get(idref)!);
    }
  });

  return hrefs;
}
