const EOCD_SIG = 0x06054b50;
const CD_ENTRY_SIG = 0x02014b50;
const LFH_SIG = 0x04034b50;
const COMPRESSION_STORED = 0;
const COMPRESSION_DEFLATED = 8;

export class ZipEntry {
  readonly #data: Uint8Array<ArrayBuffer>;
  readonly #method: number;
  readonly #uncompressedSize: number;

  constructor(
    data: Uint8Array<ArrayBuffer>,
    method: number,
    uncompressedSize: number,
  ) {
    this.#data = data;
    this.#method = method;
    this.#uncompressedSize = uncompressedSize;
  }

  async async(_type: "string"): Promise<string> {
    const bytes = await this.#decompress();
    return new TextDecoder().decode(bytes);
  }

  async #decompress(): Promise<Uint8Array> {
    if (this.#method === COMPRESSION_STORED) return this.#data;

    if (this.#method === COMPRESSION_DEFLATED) {
      const ds = new DecompressionStream("deflate-raw");
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();

      writer.write(this.#data);
      writer.close();

      const chunks: Uint8Array[] = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const out = new Uint8Array(this.#uncompressedSize);
      let pos = 0;
      for (const chunk of chunks) {
        out.set(chunk, pos);
        pos += chunk.byteLength;
      }
      return out;
    }

    throw new Error(`Unsupported ZIP compression method: ${this.#method}`);
  }
}

export class ZipArchive {
  readonly #entries: Map<string, ZipEntry>;

  private constructor(entries: Map<string, ZipEntry>) {
    this.#entries = entries;
  }

  file(path: string): ZipEntry | null {
    return this.#entries.get(path) ?? null;
  }

  static async loadAsync(buf: ArrayBuffer): Promise<ZipArchive> {
    const view = new DataView(buf);
    const bytes = new Uint8Array(buf);

    const eocdOffset = findEocd(view, bytes.length);
    if (eocdOffset < 0) throw new Error("Invalid ZIP: EOCD not found");

    const totalEntries = view.getUint16(eocdOffset + 10, true);
    const cdOffset = view.getUint32(eocdOffset + 16, true);

    const entries = new Map<string, ZipEntry>();
    let pos = cdOffset;

    for (let i = 0; i < totalEntries; i++) {
      if (view.getUint32(pos, true) !== CD_ENTRY_SIG) break;

      const method = view.getUint16(pos + 10, true);
      const compressedSize = view.getUint32(pos + 20, true);
      const uncompressedSize = view.getUint32(pos + 24, true);
      const filenameLen = view.getUint16(pos + 28, true);
      const extraLen = view.getUint16(pos + 30, true);
      const commentLen = view.getUint16(pos + 32, true);
      const localHeaderOffset = view.getUint32(pos + 42, true);

      const filename = new TextDecoder().decode(
        bytes.subarray(pos + 46, pos + 46 + filenameLen),
      );
      pos += 46 + filenameLen + extraLen + commentLen;

      if (view.getUint32(localHeaderOffset, true) !== LFH_SIG) continue;
      const lfhFilenameLen = view.getUint16(localHeaderOffset + 26, true);
      const lfhExtraLen = view.getUint16(localHeaderOffset + 28, true);
      const dataOffset = localHeaderOffset + 30 + lfhFilenameLen + lfhExtraLen;

      const data = bytes.subarray(dataOffset, dataOffset + compressedSize);
      entries.set(filename, new ZipEntry(data, method, uncompressedSize));
    }

    return new ZipArchive(entries);
  }
}

function findEocd(view: DataView, size: number): number {
  // max ZIP comment = 65535 bytes; EOCD itself = 22 bytes
  const limit = Math.max(0, size - 65557);
  for (let i = size - 22; i >= limit; i--) {
    if (view.getUint32(i, true) === EOCD_SIG) return i;
  }
  return -1;
}

/** Build an in-memory ZIP (STORED, no compression) — for tests only. */
export function buildTestZip(files: Record<string, string>): ArrayBuffer {
  const enc = new TextEncoder();

  type Entry = { name: Uint8Array; data: Uint8Array; localOffset: number };
  const entries: Entry[] = [];
  const localParts: Uint8Array[] = [];
  let localOffset = 0;

  for (const [path, content] of Object.entries(files)) {
    const name = enc.encode(path);
    const data = enc.encode(content);

    const lfh = new Uint8Array(30 + name.length);
    const lv = new DataView(lfh.buffer);
    lv.setUint32(0, LFH_SIG, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(8, COMPRESSION_STORED, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    lfh.set(name, 30);

    entries.push({ name, data, localOffset });
    localParts.push(lfh, data);
    localOffset += lfh.length + data.length;
  }

  const cdParts: Uint8Array[] = [];
  for (const { name, data, localOffset: off } of entries) {
    const cd = new Uint8Array(46 + name.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, CD_ENTRY_SIG, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(10, COMPRESSION_STORED, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, off, true);
    cd.set(name, 46);
    cdParts.push(cd);
  }

  const cdSize = cdParts.reduce((s, e) => s + e.length, 0);

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, EOCD_SIG, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, localOffset, true);

  const totalSize = localOffset + cdSize + 22;
  const result = new Uint8Array(totalSize);
  let pos = 0;
  for (const part of [...localParts, ...cdParts, eocd]) {
    result.set(part, pos);
    pos += part.length;
  }
  return result.buffer as ArrayBuffer;
}
