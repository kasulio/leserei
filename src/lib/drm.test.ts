import { expect, test } from "bun:test";

import {
  assertNotDrmProtected,
  contentLooksEncrypted,
  DrmProtectedError,
  encryptionXmlIndicatesDrm,
} from "./drm";
import { buildTestZip, ZipArchive } from "./zip";

const FONT_OBFUSCATION = `<?xml version="1.0" encoding="UTF-8"?>
<encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <EncryptedData xmlns="http://www.w3.org/2001/04/xmlenc#">
    <EncryptionMethod Algorithm="http://www.idpf.org/2008/embedding"/>
    <CipherData>
      <CipherReference URI="fonts/Book.ttf"/>
    </CipherData>
  </EncryptedData>
</encryption>`;

const CONTENT_ENCRYPTION = `<?xml version="1.0" encoding="UTF-8"?>
<encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <EncryptedData xmlns="http://www.w3.org/2001/04/xmlenc#">
    <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes128-cbc"/>
    <CipherData>
      <CipherReference URI="OEBPS/chapter1.xhtml"/>
    </CipherData>
  </EncryptedData>
</encryption>`;

test("encryptionXmlIndicatesDrm: font obfuscation only is not DRM", () => {
  expect(encryptionXmlIndicatesDrm(FONT_OBFUSCATION)).toBe(false);
});

test("encryptionXmlIndicatesDrm: encrypted spine content is DRM", () => {
  expect(encryptionXmlIndicatesDrm(CONTENT_ENCRYPTION)).toBe(true);
});

test("contentLooksEncrypted: readable XHTML is not encrypted", () => {
  expect(
    contentLooksEncrypted(
      '<?xml version="1.0"?><html><body><p>Hi</p></body></html>',
    ),
  ).toBe(false);
});

test("contentLooksEncrypted: binary-looking payload is encrypted", () => {
  const binary = "\x00\x01\x02\x03\x04\x05".repeat(40);
  expect(contentLooksEncrypted(binary)).toBe(true);
});

test("assertNotDrmProtected: rights.xml throws", async () => {
  const zip = await ZipArchive.loadAsync(
    buildTestZip({ "META-INF/rights.xml": "<rights/>" }),
  );
  await expect(assertNotDrmProtected(zip)).rejects.toBeInstanceOf(
    DrmProtectedError,
  );
});

test("assertNotDrmProtected: LCP license throws", async () => {
  const zip = await ZipArchive.loadAsync(
    buildTestZip({ "META-INF/license.lcpl": "{}" }),
  );
  await expect(assertNotDrmProtected(zip)).rejects.toBeInstanceOf(
    DrmProtectedError,
  );
});

test("assertNotDrmProtected: font-only encryption.xml passes", async () => {
  const zip = await ZipArchive.loadAsync(
    buildTestZip({ "META-INF/encryption.xml": FONT_OBFUSCATION }),
  );
  await expect(assertNotDrmProtected(zip)).resolves.toBeUndefined();
});

test("assertNotDrmProtected: content encryption.xml throws", async () => {
  const zip = await ZipArchive.loadAsync(
    buildTestZip({ "META-INF/encryption.xml": CONTENT_ENCRYPTION }),
  );
  await expect(assertNotDrmProtected(zip)).rejects.toBeInstanceOf(
    DrmProtectedError,
  );
});
