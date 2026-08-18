import piexif from "piexifjs";
import type { Asset } from "@/contexts/AssetsContext";
import { isDesktop, hasNativeTools } from "./env";
import { tauriAPI } from "./tauriAPI";
import { toast } from "sonner";
import { getBatchDownloadPath, setBatchDownloadPath } from "./batchDownloadPath";

/**
 * Race a promise against a timeout. Rejects with a descriptive error if the
 * timeout fires first. Used to prevent the UI from hanging when a Rust IPC
 * call (e.g. ExifTool/FFmpeg) gets stuck on a problematic file.
 */
const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
    }),
  ]).finally(() => clearTimeout(timer!));
};

interface MetadataToEmbed {
  title: string;
  description: string;
  keywords: string[];
}

/**
 * Convert a File to a base64 data URL
 */
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert a base64 data URL to a Blob
 */
const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Encode a string to bytes for EXIF UserComment
 */
const encodeUserComment = (text: string): string => {
  // ASCII prefix for UserComment
  const prefix = "ASCII\0\0\0";
  return prefix + text;
};

// Encode string to UCS-2/UTF-16LE bytes with null terminator (for XP* fields)
const encodeUcs2LEWithNull = (str: string): number[] => {
  const len = str.length;
  const u8 = new Uint8Array((len + 1) * 2);
  for (let i = 0; i < len; i++) {
    const code = str.charCodeAt(i);
    u8[i * 2] = code & 0xff;
    u8[i * 2 + 1] = (code >> 8) & 0xff;
  }
  return Array.from(u8);
};
/**
 * Create XMP packet with Dublin Core metadata
 * This is the industry-standard way to embed metadata for stock sites
 */
const createXMPPacket = (metadata: MetadataToEmbed): string => {
  const keywordsXML = metadata.keywords
    .map((k) => `          <rdf:li>${escapeXML(k)}</rdf:li>`)
    .join("\n");

  const xmpPacket = `<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Tagyfy Pro">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
        xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escapeXML(metadata.title)}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escapeXML(metadata.description)}</rdf:li>
        </rdf:Alt>
      </dc:description>
      <dc:subject>
        <rdf:Bag>
${keywordsXML}
        </rdf:Bag>
      </dc:subject>
      <photoshop:Headline>${escapeXML(metadata.title)}</photoshop:Headline>
      <photoshop:CaptionWriter>Tagyfy Pro</photoshop:CaptionWriter>
      <xmp:CreatorTool>Tagyfy Pro</xmp:CreatorTool>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  return xmpPacket;
};

/**
 * Escape special XML characters
 */
const escapeXML = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/**
 * Create IPTC-IIM block for legacy compatibility
 * This ensures metadata is readable by older software
 */
const createIPTCBlock = (metadata: MetadataToEmbed): Uint8Array => {
  const blocks: Uint8Array[] = [];

  // IPTC record marker: 0x1C (tag marker)
  // Record 2 = Application Record

  // 2:05 - Object Name/Title (max 64 chars standard, but we allow full length for compatibility)
  const titleBytes = encodeIPTCString(metadata.title);
  blocks.push(createIPTCTag(2, 5, titleBytes));

  // 2:25 - Keywords (repeatable, max 64 chars each)
  // No hardcoded count cap — the keyword count is already controlled by the
  // user's settings slider. Embedding all generated keywords ensures the
  // embedded file matches the exported CSV exactly.
  for (const keyword of metadata.keywords) {
    const keywordBytes = encodeIPTCString(keyword.substring(0, 64));
    blocks.push(createIPTCTag(2, 25, keywordBytes));
  }

  // 2:55 - Date Created (YYYYMMDD)
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  blocks.push(createIPTCTag(2, 55, encodeIPTCString(dateStr)));

  // 2:105 - Headline (max 256 chars)
  const headlineBytes = encodeIPTCString(metadata.title.substring(0, 256));
  blocks.push(createIPTCTag(2, 105, headlineBytes));

  // 2:120 - Caption/Abstract (max 2000 chars)
  const captionBytes = encodeIPTCString(metadata.description.substring(0, 2000));
  blocks.push(createIPTCTag(2, 120, captionBytes));

  // 2:122 - Writer/Editor
  blocks.push(createIPTCTag(2, 122, encodeIPTCString("Tagyfy Pro")));

  // Combine all blocks
  const totalLength = blocks.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const block of blocks) {
    result.set(block, offset);
    offset += block.length;
  }

  return result;
};

/**
 * Create a single IPTC tag
 */
const createIPTCTag = (record: number, dataset: number, data: Uint8Array): Uint8Array => {
  const length = data.length;

  if (length < 32768) {
    // Standard length encoding (2 bytes)
    const tag = new Uint8Array(5 + length);
    tag[0] = 0x1C; // Tag marker
    tag[1] = record;
    tag[2] = dataset;
    tag[3] = (length >> 8) & 0xFF;
    tag[4] = length & 0xFF;
    tag.set(data, 5);
    return tag;
  } else {
    // Extended length encoding (4 bytes)
    const tag = new Uint8Array(7 + length);
    tag[0] = 0x1C;
    tag[1] = record;
    tag[2] = dataset;
    tag[3] = 0x80; // Extended flag
    tag[4] = 0x04; // Length of length field
    tag[5] = (length >> 24) & 0xFF;
    tag[6] = (length >> 16) & 0xFF;
    tag[7] = (length >> 8) & 0xFF;
    tag[8] = length & 0xFF;
    tag.set(data, 9);
    return tag;
  }
};

/**
 * Encode string for IPTC (UTF-8)
 */
const encodeIPTCString = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

/**
 * Embed metadata into JPEG using piexifjs + XMP + IPTC
 * Writes to EXIF, XMP-dc, and IPTC fields for maximum compatibility
 */
const embedJpegMetadata = async (
  file: File,
  metadata: MetadataToEmbed
): Promise<Blob> => {
  const dataUrl = await fileToDataUrl(file);

  let exifObj: any;
  try {
    // Try to load existing EXIF data
    exifObj = piexif.load(dataUrl);
  } catch {
    // Create new EXIF structure if none exists
    exifObj = { "0th": {}, Exif: {}, GPS: {}, Interop: {}, "1st": {} };
  }

  // Ensure all sections exist
  exifObj["0th"] = exifObj["0th"] || {};
  exifObj.Exif = exifObj.Exif || {};

  // Keywords as clean comma-separated string
  const keywordsStr = metadata.keywords.join(", ");
  const keywordsSemicolon = metadata.keywords.join("; ");

  // Write to 0th IFD (main image tags)
  // ImageDescription - Title (EXIF standard)
  exifObj["0th"][piexif.ImageIFD.ImageDescription] = metadata.title;

  // XPTitle (Windows property) - Title
  exifObj["0th"][piexif.ImageIFD.XPTitle] = encodeUcs2LEWithNull(metadata.title);

  // XPComment - Description
  exifObj["0th"][piexif.ImageIFD.XPComment] = encodeUcs2LEWithNull(metadata.description);

  // XPKeywords - Keywords (semicolon separated for Windows compatibility)
  exifObj["0th"][piexif.ImageIFD.XPKeywords] = encodeUcs2LEWithNull(keywordsSemicolon);

  // XPSubject - Also use for keywords/subject
  exifObj["0th"][piexif.ImageIFD.XPSubject] = encodeUcs2LEWithNull(keywordsSemicolon);

  // Artist field
  exifObj["0th"][piexif.ImageIFD.Artist] = "Tagyfy Pro";

  // Software
  exifObj["0th"][piexif.ImageIFD.Software] = "Tagyfy Pro";

  // Write to Exif IFD
  // UserComment - Full description
  exifObj.Exif[piexif.ExifIFD.UserComment] = encodeUserComment(metadata.description);

  // Generate new EXIF binary
  const exifBytes = piexif.dump(exifObj);

  // Insert EXIF into image
  let newDataUrl = piexif.insert(exifBytes, dataUrl);

  // Now add XMP packet for industry-standard metadata
  const xmpPacket = createXMPPacket(metadata);
  const iptcBlock = createIPTCBlock(metadata);

  // Convert to blob and inject XMP/IPTC
  const blobWithExif = dataUrlToBlob(newDataUrl);
  const arrayBuffer = await blobWithExif.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  // Find the position after APP0/APP1 markers to insert APP13 (IPTC) and APP1 (XMP)
  const finalBlob = injectXMPAndIPTC(uint8, xmpPacket, iptcBlock);

  return finalBlob;
};

/**
 * Inject XMP and IPTC data into JPEG
 */
const injectXMPAndIPTC = (
  jpegData: Uint8Array,
  xmpPacket: string,
  iptcBlock: Uint8Array
): Blob => {
  // Find position to insert (after SOI and initial markers)
  // JPEG structure: SOI (FFD8) + markers + image data

  // Find the first non-APP marker or SOS (FFDA)
  let insertPos = 2; // After SOI
  let pos = 2;

  while (pos < jpegData.length - 1) {
    if (jpegData[pos] !== 0xFF) break;

    const marker = jpegData[pos + 1];

    // Stop at SOS (Start of Scan) or image data
    if (marker === 0xDA || marker === 0x00) break;

    // Skip marker
    if (marker >= 0xE0 && marker <= 0xEF) {
      // APP markers - skip them
      const length = (jpegData[pos + 2] << 8) | jpegData[pos + 3];
      pos += 2 + length;
      insertPos = pos;
    } else if (marker === 0xDB || marker === 0xC0 || marker === 0xC2 || marker === 0xC4) {
      // DQT, SOF0, SOF2, DHT - stop here
      break;
    } else {
      pos += 2;
      insertPos = pos;
    }
  }

  // Create APP1 XMP marker
  const xmpBytes = new TextEncoder().encode(xmpPacket);
  const xmpHeader = new TextEncoder().encode("http://ns.adobe.com/xap/1.0/\0");
  const xmpMarkerLength = 2 + xmpHeader.length + xmpBytes.length;

  const xmpMarker = new Uint8Array(2 + 2 + xmpHeader.length + xmpBytes.length);
  xmpMarker[0] = 0xFF;
  xmpMarker[1] = 0xE1; // APP1
  xmpMarker[2] = (xmpMarkerLength >> 8) & 0xFF;
  xmpMarker[3] = xmpMarkerLength & 0xFF;
  xmpMarker.set(xmpHeader, 4);
  xmpMarker.set(xmpBytes, 4 + xmpHeader.length);

  // Create APP13 IPTC marker (Photoshop format)
  const iptcHeader = new TextEncoder().encode("Photoshop 3.0\0");
  const iptc8BIM = new Uint8Array([
    0x38, 0x42, 0x49, 0x4D, // "8BIM"
    0x04, 0x04, // Resource ID for IPTC-NAA
    0x00, 0x00, // Pascal string (empty name)
    (iptcBlock.length >> 24) & 0xFF,
    (iptcBlock.length >> 16) & 0xFF,
    (iptcBlock.length >> 8) & 0xFF,
    iptcBlock.length & 0xFF,
  ]);

  const app13DataLength = iptcHeader.length + iptc8BIM.length + iptcBlock.length;
  const app13MarkerLength = 2 + app13DataLength;

  const app13Marker = new Uint8Array(2 + 2 + app13DataLength);
  app13Marker[0] = 0xFF;
  app13Marker[1] = 0xED; // APP13
  app13Marker[2] = (app13MarkerLength >> 8) & 0xFF;
  app13Marker[3] = app13MarkerLength & 0xFF;
  app13Marker.set(iptcHeader, 4);
  app13Marker.set(iptc8BIM, 4 + iptcHeader.length);
  app13Marker.set(iptcBlock, 4 + iptcHeader.length + iptc8BIM.length);

  // Build final JPEG
  const before = jpegData.slice(0, insertPos);
  const after = jpegData.slice(insertPos);

  const finalJpeg = new Uint8Array(before.length + xmpMarker.length + app13Marker.length + after.length);
  finalJpeg.set(before, 0);
  finalJpeg.set(xmpMarker, before.length);
  finalJpeg.set(app13Marker, before.length + xmpMarker.length);
  finalJpeg.set(after, before.length + xmpMarker.length + app13Marker.length);

  return new Blob([finalJpeg], { type: "image/jpeg" });
};

/**
 * Embed metadata into PNG using tEXt chunks and iTXt for XMP
 * PNG doesn't support IPTC natively, but we add XMP via iTXt chunks
 */
const embedPngMetadata = async (
  file: File,
  metadata: MetadataToEmbed
): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  // PNG signature check
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  const isPng = pngSignature.every((byte, i) => uint8[i] === byte);
  if (!isPng) {
    throw new Error("Not a valid PNG file");
  }

  // Create text chunks for metadata
  const textChunks = createPngTextChunks(metadata);

  // Create iTXt chunk for XMP (international text)
  const xmpChunk = createPngXMPChunk(metadata);

  // Find IEND chunk position and insert chunks before it
  let iendPos = -1;
  let pos = 8; // Skip signature

  while (pos < uint8.length) {
    const length = (uint8[pos] << 24) | (uint8[pos + 1] << 16) | (uint8[pos + 2] << 8) | uint8[pos + 3];
    const chunkType = String.fromCharCode(uint8[pos + 4], uint8[pos + 5], uint8[pos + 6], uint8[pos + 7]);

    if (chunkType === "IEND") {
      iendPos = pos;
      break;
    }

    pos += 12 + length; // 4 length + 4 type + length data + 4 CRC
  }

  if (iendPos === -1) {
    throw new Error("Invalid PNG: IEND chunk not found");
  }

  // Build new PNG with metadata chunks inserted before IEND
  const beforeIend = uint8.slice(0, iendPos);
  const iendChunk = uint8.slice(iendPos);

  const newPng = new Uint8Array(beforeIend.length + textChunks.length + xmpChunk.length + iendChunk.length);
  newPng.set(beforeIend, 0);
  newPng.set(textChunks, beforeIend.length);
  newPng.set(xmpChunk, beforeIend.length + textChunks.length);
  newPng.set(iendChunk, beforeIend.length + textChunks.length + xmpChunk.length);

  return new Blob([newPng], { type: "image/png" });
};

/**
 * Create PNG tEXt chunks for metadata
 */
const createPngTextChunks = (metadata: MetadataToEmbed): Uint8Array => {
  const chunks: Uint8Array[] = [];

  // Add Title chunk
  chunks.push(createPngTextChunk("Title", metadata.title));

  // Add Description chunk
  chunks.push(createPngTextChunk("Description", metadata.description));

  // Add Keywords chunk (comma separated)
  chunks.push(createPngTextChunk("Keywords", metadata.keywords.join(", ")));

  // Add Comment chunk with all metadata
  const comment = `Title: ${metadata.title}\nDescription: ${metadata.description}\nKeywords: ${metadata.keywords.join(", ")}`;
  chunks.push(createPngTextChunk("Comment", comment));

  // Concatenate all chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
};

/**
 * Create PNG iTXt chunk for XMP data
 */
const createPngXMPChunk = (metadata: MetadataToEmbed): Uint8Array => {
  const xmpPacket = createXMPPacket(metadata);
  const encoder = new TextEncoder();

  // iTXt structure:
  // keyword (1-79 bytes) + null + compression flag (1 byte) + compression method (1 byte) +
  // language tag + null + translated keyword + null + text

  const keyword = encoder.encode("XML:com.adobe.xmp");
  const compressionFlag = 0; // No compression
  const compressionMethod = 0;
  const languageTag = new Uint8Array(0); // Empty
  const translatedKeyword = new Uint8Array(0); // Empty
  const xmpBytes = encoder.encode(xmpPacket);

  const dataLength = keyword.length + 1 + 1 + 1 + languageTag.length + 1 + translatedKeyword.length + 1 + xmpBytes.length;
  const chunk = new Uint8Array(12 + dataLength);

  // Length (big-endian)
  chunk[0] = (dataLength >> 24) & 0xff;
  chunk[1] = (dataLength >> 16) & 0xff;
  chunk[2] = (dataLength >> 8) & 0xff;
  chunk[3] = dataLength & 0xff;

  // Type: "iTXt"
  chunk[4] = 0x69; // i
  chunk[5] = 0x54; // T
  chunk[6] = 0x58; // X
  chunk[7] = 0x74; // t

  // Data
  let offset = 8;
  chunk.set(keyword, offset);
  offset += keyword.length;
  chunk[offset++] = 0; // null separator
  chunk[offset++] = compressionFlag;
  chunk[offset++] = compressionMethod;
  // Empty language tag, null terminated
  offset += languageTag.length;
  chunk[offset++] = 0;
  // Empty translated keyword, null terminated
  offset += translatedKeyword.length;
  chunk[offset++] = 0;
  // XMP text
  chunk.set(xmpBytes, offset);

  // Calculate CRC32 for type + data
  const crcData = chunk.slice(4, 8 + dataLength);
  const crc = crc32(crcData);

  chunk[8 + dataLength] = (crc >> 24) & 0xff;
  chunk[8 + dataLength + 1] = (crc >> 16) & 0xff;
  chunk[8 + dataLength + 2] = (crc >> 8) & 0xff;
  chunk[8 + dataLength + 3] = crc & 0xff;

  return chunk;
};

/**
 * Create a single PNG tEXt chunk
 */
const createPngTextChunk = (keyword: string, text: string): Uint8Array => {
  const encoder = new TextEncoder();
  const keywordBytes = encoder.encode(keyword);
  const textBytes = encoder.encode(text);

  // tEXt chunk: keyword + null separator + text
  const dataLength = keywordBytes.length + 1 + textBytes.length;
  const chunk = new Uint8Array(12 + dataLength); // 4 length + 4 type + data + 4 CRC

  // Length (big-endian)
  chunk[0] = (dataLength >> 24) & 0xff;
  chunk[1] = (dataLength >> 16) & 0xff;
  chunk[2] = (dataLength >> 8) & 0xff;
  chunk[3] = dataLength & 0xff;

  // Type: "tEXt"
  chunk[4] = 0x74; // t
  chunk[5] = 0x45; // E
  chunk[6] = 0x58; // X
  chunk[7] = 0x74; // t

  // Data: keyword + null + text
  chunk.set(keywordBytes, 8);
  chunk[8 + keywordBytes.length] = 0; // null separator
  chunk.set(textBytes, 8 + keywordBytes.length + 1);

  // Calculate CRC32 for type + data
  const crcData = chunk.slice(4, 8 + dataLength);
  const crc = crc32(crcData);

  chunk[8 + dataLength] = (crc >> 24) & 0xff;
  chunk[8 + dataLength + 1] = (crc >> 16) & 0xff;
  chunk[8 + dataLength + 2] = (crc >> 8) & 0xff;
  chunk[8 + dataLength + 3] = crc & 0xff;

  return chunk;
};

/**
 * CRC32 calculation for PNG chunks
 */
const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  const table = getCrcTable();

  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
};

let crcTable: number[] | null = null;

const getCrcTable = (): number[] => {
  if (crcTable) return crcTable;

  crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[n] = c;
  }

  return crcTable;
};

/**
 * Embed metadata into WebP using RIFF chunk structure.
 *
 * WebP files are RIFF containers. Metadata is stored in two optional chunks:
 *   - EXIF chunk (tag "EXIF"): raw EXIF bytes — widely read by Lightroom, Bridge, etc.
 *   - XMP  chunk (tag "XMP "): raw XMP packet — read by Adobe Stock, Shutterstock, etc.
 *
 * Structure of a WebP RIFF file:
 *   RIFF header (12 bytes):  "RIFF" + uint32le fileSize + "WEBP"
 *   Chunk sequence:          chunkFourCC (4 bytes) + uint32le chunkSize + chunkData
 *                            (padded to even byte boundary)
 *
 * We inject the XMP chunk immediately after the VP8/VP8L/VP8X chunk so that
 * any reader scanning from the start encounters metadata early.
 * EXIF is appended after XMP.  Existing EXIF/XMP chunks (if any) are stripped
 * first so we never end up with duplicate metadata blocks.
 */
const embedWebpMetadata = async (
  file: File,
  metadata: MetadataToEmbed
): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const src = new Uint8Array(arrayBuffer);

  // ── Validate RIFF / WEBP header ──────────────────────────────────────────
  const readFourCC = (offset: number) =>
    String.fromCharCode(src[offset], src[offset + 1], src[offset + 2], src[offset + 3]);
  const readU32LE = (offset: number) =>
    src[offset] | (src[offset + 1] << 8) | (src[offset + 2] << 16) | (src[offset + 3] << 24);

  if (readFourCC(0) !== "RIFF" || readFourCC(8) !== "WEBP") {
    throw new Error("Not a valid WebP file");
  }

  // ── Build XMP chunk ───────────────────────────────────────────────────────
  const xmpPacket = createXMPPacket(metadata);
  const xmpData = new TextEncoder().encode(xmpPacket);
  const xmpChunk = buildRiffChunk("XMP ", xmpData);

  // ── Build minimal EXIF chunk (IFD0 with title + description + keywords) ──
  const exifBytes = buildMinimalExifForWebp(metadata);
  const exifChunk = buildRiffChunk("EXIF", exifBytes);

  // ── Walk existing chunks, strip old EXIF/XMP, collect the rest ───────────
  const keptChunks: Uint8Array[] = [];
  let insertAfter: Uint8Array | null = null; // we insert new metadata after this chunk
  let pos = 12; // skip RIFF header (4 RIFF + 4 size + 4 WEBP)

  while (pos + 8 <= src.length) {
    const fourCC = readFourCC(pos);
    const chunkSize = readU32LE(pos + 4);
    const paddedSize = chunkSize + (chunkSize & 1); // RIFF chunks are padded to even size
    const chunkEnd = pos + 8 + paddedSize;

    if (fourCC === "EXIF" || fourCC === "XMP ") {
      // Drop existing metadata chunks — we will replace them
    } else {
      const chunkBytes = src.slice(pos, Math.min(chunkEnd, src.length));
      keptChunks.push(chunkBytes);

      // Insert our new metadata right after the primary image data chunk
      if (fourCC === "VP8 " || fourCC === "VP8L" || fourCC === "VP8X") {
        insertAfter = chunkBytes;
      }
    }
    pos = chunkEnd;
  }

  // ── Reassemble chunks with metadata injected ─────────────────────────────
  const ordered: Uint8Array[] = [];
  let metaInserted = false;

  for (const chunk of keptChunks) {
    ordered.push(chunk);
    if (!metaInserted && (chunk === insertAfter || keptChunks.indexOf(chunk) === keptChunks.length - 1)) {
      ordered.push(xmpChunk);
      ordered.push(exifChunk);
      metaInserted = true;
    }
  }
  if (!metaInserted) {
    ordered.push(xmpChunk);
    ordered.push(exifChunk);
  }

  // ── Write final RIFF container ───────────────────────────────────────────
  const totalChunkBytes = ordered.reduce((s, c) => s + c.length, 0);
  const riffSize = 4 + totalChunkBytes; // 4 = "WEBP" fourCC
  const output = new Uint8Array(12 + totalChunkBytes);

  // RIFF header
  output[0] = 0x52; output[1] = 0x49; output[2] = 0x46; output[3] = 0x46; // "RIFF"
  output[4] = riffSize & 0xFF;
  output[5] = (riffSize >> 8) & 0xFF;
  output[6] = (riffSize >> 16) & 0xFF;
  output[7] = (riffSize >> 24) & 0xFF;
  output[8] = 0x57; output[9] = 0x45; output[10] = 0x42; output[11] = 0x50; // "WEBP"

  let off = 12;
  for (const chunk of ordered) {
    output.set(chunk, off);
    off += chunk.length;
  }

  return new Blob([output], { type: "image/webp" });
};

/** Build a RIFF chunk: fourCC (4) + size uint32le (4) + data + optional pad byte */
const buildRiffChunk = (fourCC: string, data: Uint8Array): Uint8Array => {
  const padded = data.length & 1; // 1 if we need a padding byte
  const chunk = new Uint8Array(8 + data.length + padded);
  for (let i = 0; i < 4; i++) chunk[i] = fourCC.charCodeAt(i);
  const size = data.length;
  chunk[4] = size & 0xFF;
  chunk[5] = (size >> 8) & 0xFF;
  chunk[6] = (size >> 16) & 0xFF;
  chunk[7] = (size >> 24) & 0xFF;
  chunk.set(data, 8);
  // padding byte is already 0 from Uint8Array initialization
  return chunk;
};

/**
 * Build a minimal EXIF block for WebP containing:
 *   IFD0: ImageDescription (title), XPKeywords (semicolon-sep keywords),
 *         XPComment (description), Artist, Software
 *
 * EXIF is a TIFF-structured blob prefixed with the "Exif\0\0" header
 * (6 bytes) followed by a standard little-endian TIFF header + IFD.
 *
 * We write only a handful of ASCII tags — enough for Bridge / Lightroom
 * to pick up the metadata without replicating the full piexifjs stack.
 */
const buildMinimalExifForWebp = (metadata: MetadataToEmbed): Uint8Array => {
  const enc = new TextEncoder();

  // ASCII strings as null-terminated byte arrays
  const toAsciiBytes = (s: string): Uint8Array => {
    const b = enc.encode(s);
    const out = new Uint8Array(b.length + 1);
    out.set(b);
    return out; // null terminated
  };

  const titleBytes   = toAsciiBytes(metadata.title);
  const descBytes    = toAsciiBytes(metadata.description);
  const kwBytes      = toAsciiBytes(metadata.keywords.join("; "));
  const artistBytes  = toAsciiBytes("Tagyfy Pro");
  const softBytes    = toAsciiBytes("Tagyfy Pro");

  // Tags we write (IFD0):
  // 0x010E ImageDescription  = title
  // 0x013B Artist            = tool
  // 0x0131 Software          = tool
  // 0x9286 UserComment tag is Exif-IFD only — skip for simplicity
  // We write 5 entries
  const NUM_ENTRIES = 5;
  const strings = [titleBytes, descBytes, kwBytes, artistBytes, softBytes];
  const tagIds   = [0x010E, 0x9C9B, 0x9C9C, 0x013B, 0x0131];
  // 0x9C9B = XPKeywords, 0x9C9C = XPComment (Windows EXIF extensions)

  // TIFF layout:
  //   6 bytes   "Exif\0\0" prefix
  //   8 bytes   TIFF header (II + 0x002A + offset to IFD0 = 8)
  //   2 bytes   IFD entry count
  //   12*N bytes  IFD entries
  //   4 bytes   next IFD offset (0)
  //   string data appended after IFD

  const ifdOffset = 8; // relative to TIFF header start (= after "Exif\0\0")
  const ifdSize   = 2 + NUM_ENTRIES * 12 + 4;
  const dataStart = ifdOffset + ifdSize; // where string data begins (relative to TIFF start)

  // Calculate total string data size
  const totalStringBytes = strings.reduce((s, b) => s + b.length, 0);
  const tiffSize = ifdOffset + ifdSize + totalStringBytes;
  const buf = new Uint8Array(6 + tiffSize);

  // "Exif\0\0" prefix
  buf[0] = 0x45; buf[1] = 0x78; buf[2] = 0x69; buf[3] = 0x66;
  buf[4] = 0x00; buf[5] = 0x00;

  // TIFF header (little-endian): "II" + 0x002A + IFD offset
  const tb = 6; // TIFF base index in buf
  buf[tb]   = 0x49; buf[tb+1] = 0x49; // "II" = little-endian
  buf[tb+2] = 0x2A; buf[tb+3] = 0x00; // magic 42
  buf[tb+4] = ifdOffset & 0xFF; buf[tb+5] = (ifdOffset >> 8) & 0xFF;
  buf[tb+6] = 0x00; buf[tb+7] = 0x00; // IFD offset high bytes

  // IFD entry count
  const ifdBase = tb + ifdOffset;
  buf[ifdBase]   = NUM_ENTRIES & 0xFF;
  buf[ifdBase+1] = (NUM_ENTRIES >> 8) & 0xFF;

  // Write each IFD entry
  let strOff = dataStart; // current string data offset (relative to TIFF start)
  for (let i = 0; i < NUM_ENTRIES; i++) {
    const entryBase = ifdBase + 2 + i * 12;
    const tagId = tagIds[i];
    const strBytes = strings[i];

    const writeU16 = (o: number, v: number) => {
      buf[o] = v & 0xFF; buf[o+1] = (v >> 8) & 0xFF;
    };
    const writeU32 = (o: number, v: number) => {
      buf[o] = v & 0xFF; buf[o+1] = (v >> 8) & 0xFF;
      buf[o+2] = (v >> 16) & 0xFF; buf[o+3] = (v >> 24) & 0xFF;
    };

    writeU16(entryBase,     tagId);  // tag
    writeU16(entryBase + 2, 2);      // type = ASCII
    writeU32(entryBase + 4, strBytes.length); // count
    if (strBytes.length <= 4) {
      // Value fits inline
      buf.set(strBytes, entryBase + 8);
    } else {
      // Value is an offset (relative to TIFF start)
      writeU32(entryBase + 8, strOff);
      buf.set(strBytes, tb + strOff);
    }
    strOff += strBytes.length;
  }

  // Next IFD offset = 0 (no more IFDs)
  const nextIfdOff = ifdBase + 2 + NUM_ENTRIES * 12;
  buf[nextIfdOff] = 0; buf[nextIfdOff+1] = 0;
  buf[nextIfdOff+2] = 0; buf[nextIfdOff+3] = 0;

  return buf;
};



/**
 * Embed metadata into a file and return the modified blob.
 *
 * Supported formats and what gets embedded:
 *   jpg / jpeg  — EXIF (piexifjs) + XMP APP1 + IPTC APP13
 *   png         — tEXt chunks + iTXt XMP chunk
 *   webp        — RIFF XMP chunk + RIFF EXIF chunk
 *   mp4 / mov / avi / webm — returns original file (requires ffmpeg server-side)
 *   svg         — NOT supported in browser mode; returns original with a warning
 *   gif / ai / eps / other — NOT supported in browser mode; returns original
 */
export const embedMetadata = async (
  file: File,
  metadata: MetadataToEmbed
): Promise<{ blob: Blob; filename: string }> => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const filename = file.name;

  let blob: Blob;

  if (extension === "jpg" || extension === "jpeg") {
    blob = await embedJpegMetadata(file, metadata);
  } else if (extension === "png") {
    blob = await embedPngMetadata(file, metadata);
  } else if (extension === "webp") {
    blob = await embedWebpMetadata(file, metadata);
  } else if (extension === "svg") {
    // SVG metadata embedding is not supported in browser mode.
    // SVG files use XML-based XMP injection which requires ExifTool (desktop/native mode).
    // The original file is returned unchanged so the user still gets their file.
    toast.warning(`"${file.name}" downloaded without embedded metadata`, {
      description: `.svg files do not support metadata embedding — use Export CSV to save your metadata.`,
      duration: 5000,
    });
    blob = file;
  } else if (["mp4", "mov", "avi", "webm"].includes(extension)) {
    // Video metadata embedding requires ffmpeg (desktop/native mode only).
    // Return the original file unchanged.
    blob = file;
  } else {
    // gif, ai, eps, and any other format — no browser-side embedding available.
    blob = file;
  }

  return { blob, filename };
};

/**
 * Download an asset with embedded metadata
 */
export const downloadAssetWithMetadata = async (asset: Asset): Promise<void> => {
  if (!asset.metadata) {
    throw new Error("No metadata to embed");
  }

  const { title, description, keywords } = asset.metadata;
  try {
    const tools = await hasNativeTools();
    const name = asset.file.name.toLowerCase();
    const isVideo = name.endsWith(".mp4") || asset.file.type.startsWith("video/");
    const needsExifTool = !isVideo;
    const needsFfmpeg = isVideo;
    if (needsFfmpeg && isDesktop() && !tools.ffmpeg) {
      toast.error("ffmpeg.exe missing in resources/bin/win. Video metadata embedding cannot proceed.");
    }
  } catch { }

  // Inline embed: check native tools directly (avoids FileProcessingService circular dep)
  let blob: Blob;
  let filename: string;
  if (isDesktop()) {
    const tools = await hasNativeTools();
    const name = asset.file.name.toLowerCase();
    const isVideo = name.endsWith(".mp4") || name.endsWith(".mov") || asset.file.type.startsWith("video/");
    const hasTool = isVideo ? (tools.ffmpeg || tools.exiftool) : tools.exiftool;
    if (hasTool) {
      // Use the file's disk path when available to skip loading the entire
      // file into JS memory for IPC transfer (huge speedup for large files,
      // especially videos which can be hundreds of MB)
      const diskPath = (asset.file as any).path || (asset as any).originalPath;
      const embedInput: any = {
        name: asset.file.name,
        mimeType: asset.file.type || "application/octet-stream",
      };
      if (diskPath) {
        embedInput.path = diskPath;
      } else {
        embedInput.buffer = await asset.file.arrayBuffer();
      }
      const result = await withTimeout(
        tauriAPI.embedMetadata(embedInput, { title, description, keywords }),
        150000, // 2.5 minutes — matches Rust-side timeout with margin
        `Embedding ${asset.file.name}`
      );
      blob = result.blob;
      filename = result.filename;
    } else {
      const result = await embedMetadata(asset.file, { title, description, keywords });
      blob = result.blob;
      filename = result.filename;
    }
  } else {
    const result = await embedMetadata(asset.file, { title, description, keywords });
    blob = result.blob;
    filename = result.filename;
  }

  // Browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${filename} with embedded metadata`);
};

/**
 * Prepare asset for zip with embedded metadata
 */
export const prepareAssetForZip = async (
  asset: Asset
): Promise<{ filename: string; blob: Blob }> => {
  if (!asset.metadata) {
    throw new Error("No metadata to embed");
  }

  const { title, description, keywords } = asset.metadata;
  try {
    const tools = await hasNativeTools();
    const name = asset.file.name.toLowerCase();
    const isVideo = name.endsWith(".mp4") || asset.file.type.startsWith("video/");
    const needsExifTool = !isVideo;
    const needsFfmpeg = isVideo;
    if (needsFfmpeg && isDesktop() && !tools.ffmpeg) {
      toast.error(`ffmpeg.exe missing. "${asset.file.name}" video metadata embedding cannot proceed.`);
    }
  } catch { }

  // Inline embed: check native tools directly (avoids FileProcessingService circular dep)
  let blob: Blob;
  let filename: string;
  if (isDesktop()) {
    const tools = await hasNativeTools();
    const name = asset.file.name.toLowerCase();
    const isVideo = name.endsWith(".mp4") || name.endsWith(".mov") || asset.file.type.startsWith("video/");
    const hasTool = isVideo ? (tools.ffmpeg || tools.exiftool) : tools.exiftool;
    if (hasTool) {
      // Use the file's disk path when available to skip loading the entire
      // file into JS memory for IPC transfer (huge speedup for large files,
      // especially videos which can be hundreds of MB)
      const diskPath = (asset.file as any).path || (asset as any).originalPath;
      const embedInput: any = {
        name: asset.file.name,
        mimeType: asset.file.type || "application/octet-stream",
      };
      if (diskPath) {
        embedInput.path = diskPath;
      } else {
        embedInput.buffer = await asset.file.arrayBuffer();
      }
      const result = await withTimeout(
        tauriAPI.embedMetadata(embedInput, { title, description, keywords }),
        150000, // 2.5 minutes — matches Rust-side timeout with margin
        `Embedding ${asset.file.name}`
      );
      blob = result.blob;
      filename = result.filename;
    } else {
      const result = await embedMetadata(asset.file, { title, description, keywords });
      blob = result.blob;
      filename = result.filename;
    }
  } else {
    const result = await embedMetadata(asset.file, { title, description, keywords });
    blob = result.blob;
    filename = result.filename;
  }

  return { filename, blob };
};
