import {
  MimeType,
  ZipCentralOffset,
  ZipConfig,
  ZipDosTime,
  ZipEndOffset,
  ZipLocalOffset,
} from "@/common/config";

// Types

type ZipBytes = Uint8Array<ArrayBuffer>;

export interface ZipFile {
  path: string;
  data: ZipBytes;
}

/** A file in a zip being read. */
export interface ZipEntry {
  path: string;
  read: () => Promise<ZipBytes>;
}

// Utils

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const EMPTY_DATA = new Uint8Array(0);
const CORRUPT_ZIP = "Corrupt zip archive";

export function textZipFile(path: string, text: string): ZipFile {
  return { path, data: encoder.encode(text) };
}

export function emptyZipFolder(path: string): ZipFile {
  return { path, data: EMPTY_DATA };
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(ZipConfig.CRC_TABLE_SIZE);

  for (let index = 0; index < table.length; index++) {
    let value = index;
    for (let bit = 0; bit < ZipConfig.BITS_PER_BYTE; bit++) {
      value =
        value & 1 ? ZipConfig.CRC_POLYNOMIAL ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value;
  }

  return table;
})();

function crc32(data: ZipBytes): number {
  let crc: number = ZipConfig.CRC_SEED;

  for (const byte of data) {
    crc =
      CRC_TABLE[(crc ^ byte) & ZipConfig.BYTE_MASK] ^
      (crc >>> ZipConfig.BITS_PER_BYTE);
  }

  return (crc ^ ZipConfig.CRC_SEED) >>> 0;
}

function dosDateTime(date: Date): { time: number; date: number } {
  const year = Math.max(date.getFullYear(), ZipDosTime.EPOCH_YEAR);

  return {
    time:
      (date.getHours() << ZipDosTime.HOUR_SHIFT) |
      (date.getMinutes() << ZipDosTime.MINUTE_SHIFT) |
      (date.getSeconds() >> ZipDosTime.SECOND_SHIFT),
    date:
      ((year - ZipDosTime.EPOCH_YEAR) << ZipDosTime.YEAR_SHIFT) |
      ((date.getMonth() + ZipDosTime.MONTH_BASE) << ZipDosTime.MONTH_SHIFT) |
      date.getDate(),
  };
}

const readU16 = (view: DataView, offset: number) =>
  view.getUint16(offset, ZipConfig.LITTLE_ENDIAN);

const readU32 = (view: DataView, offset: number) =>
  view.getUint32(offset, ZipConfig.LITTLE_ENDIAN);

const writeU16 = (view: DataView, offset: number, value: number) =>
  view.setUint16(offset, value, ZipConfig.LITTLE_ENDIAN);

const writeU32 = (view: DataView, offset: number, value: number) =>
  view.setUint32(offset, value, ZipConfig.LITTLE_ENDIAN);

function findEndRecord(view: DataView): number {
  const last = view.byteLength - ZipConfig.END_RECORD_SIZE;
  const first = Math.max(0, last - ZipConfig.MAX_COMMENT_SIZE);

  for (let offset = last; offset >= first; offset--) {
    if (
      readU32(view, offset + ZipEndOffset.SIGNATURE) ===
      ZipConfig.END_RECORD_SIGNATURE
    ) {
      return offset;
    }
  }

  throw new Error(CORRUPT_ZIP);
}

async function inflate(packed: ZipBytes): Promise<ZipBytes> {
  const stream = new Blob([packed])
    .stream()
    .pipeThrough(new DecompressionStream(ZipConfig.DEFLATE_FORMAT));

  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unpack(packed: ZipBytes, method: number): Promise<ZipBytes> {
  switch (method) {
    case ZipConfig.STORED_METHOD:
      return packed;
    case ZipConfig.DEFLATED_METHOD:
      return inflate(packed);
    default:
      throw new Error(CORRUPT_ZIP);
  }
}

// Core functions

export function createZip(files: ZipFile[]): Blob {
  const locals: ZipBytes[] = [];
  const central: ZipBytes[] = [];
  const stamp = dosDateTime(new Date());
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.path);
    const crc = crc32(file.data);
    const size = file.data.length;

    const local = new Uint8Array(ZipConfig.LOCAL_HEADER_SIZE + name.length);
    const localView = new DataView(local.buffer);
    writeU32(
      localView,
      ZipLocalOffset.SIGNATURE,
      ZipConfig.LOCAL_HEADER_SIGNATURE,
    );
    writeU16(localView, ZipLocalOffset.VERSION_NEEDED, ZipConfig.VERSION);
    writeU16(localView, ZipLocalOffset.FLAGS, ZipConfig.UTF8_FLAG);
    writeU16(localView, ZipLocalOffset.METHOD, ZipConfig.STORED_METHOD);
    writeU16(localView, ZipLocalOffset.TIME, stamp.time);
    writeU16(localView, ZipLocalOffset.DATE, stamp.date);
    writeU32(localView, ZipLocalOffset.CRC, crc);
    writeU32(localView, ZipLocalOffset.PACKED_SIZE, size);
    writeU32(localView, ZipLocalOffset.SIZE, size);
    writeU16(localView, ZipLocalOffset.NAME_SIZE, name.length);
    local.set(name, ZipConfig.LOCAL_HEADER_SIZE);

    const entry = new Uint8Array(ZipConfig.CENTRAL_HEADER_SIZE + name.length);
    const entryView = new DataView(entry.buffer);
    writeU32(
      entryView,
      ZipCentralOffset.SIGNATURE,
      ZipConfig.CENTRAL_HEADER_SIGNATURE,
    );
    writeU16(entryView, ZipCentralOffset.VERSION_MADE_BY, ZipConfig.VERSION);
    writeU16(entryView, ZipCentralOffset.VERSION_NEEDED, ZipConfig.VERSION);
    writeU16(entryView, ZipCentralOffset.FLAGS, ZipConfig.UTF8_FLAG);
    writeU16(entryView, ZipCentralOffset.METHOD, ZipConfig.STORED_METHOD);
    writeU16(entryView, ZipCentralOffset.TIME, stamp.time);
    writeU16(entryView, ZipCentralOffset.DATE, stamp.date);
    writeU32(entryView, ZipCentralOffset.CRC, crc);
    writeU32(entryView, ZipCentralOffset.PACKED_SIZE, size);
    writeU32(entryView, ZipCentralOffset.SIZE, size);
    writeU16(entryView, ZipCentralOffset.NAME_SIZE, name.length);
    writeU32(entryView, ZipCentralOffset.LOCAL_OFFSET, offset);
    entry.set(name, ZipConfig.CENTRAL_HEADER_SIZE);

    locals.push(local, file.data);
    central.push(entry);
    offset += local.length + size;
  }

  const centralSize = central.reduce((total, entry) => total + entry.length, 0);

  const end = new Uint8Array(ZipConfig.END_RECORD_SIZE);
  const endView = new DataView(end.buffer);
  writeU32(endView, ZipEndOffset.SIGNATURE, ZipConfig.END_RECORD_SIGNATURE);
  writeU16(endView, ZipEndOffset.DISK_ENTRY_COUNT, files.length);
  writeU16(endView, ZipEndOffset.ENTRY_COUNT, files.length);
  writeU32(endView, ZipEndOffset.CENTRAL_SIZE, centralSize);
  writeU32(endView, ZipEndOffset.CENTRAL_OFFSET, offset);

  return new Blob([...locals, ...central, end], { type: MimeType.ZIP });
}

export async function readZip(blob: Blob): Promise<ZipEntry[]> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const end = findEndRecord(view);
  const count = readU16(view, end + ZipEndOffset.ENTRY_COUNT);
  let offset = readU32(view, end + ZipEndOffset.CENTRAL_OFFSET);

  const entries: ZipEntry[] = [];

  for (let index = 0; index < count; index++) {
    if (
      readU32(view, offset + ZipCentralOffset.SIGNATURE) !==
      ZipConfig.CENTRAL_HEADER_SIGNATURE
    ) {
      throw new Error(CORRUPT_ZIP);
    }

    const method = readU16(view, offset + ZipCentralOffset.METHOD);
    const crc = readU32(view, offset + ZipCentralOffset.CRC);
    const packedSize = readU32(view, offset + ZipCentralOffset.PACKED_SIZE);
    const nameSize = readU16(view, offset + ZipCentralOffset.NAME_SIZE);
    const extraSize = readU16(view, offset + ZipCentralOffset.EXTRA_SIZE);
    const commentSize = readU16(view, offset + ZipCentralOffset.COMMENT_SIZE);
    const local = readU32(view, offset + ZipCentralOffset.LOCAL_OFFSET);
    const name = offset + ZipConfig.CENTRAL_HEADER_SIZE;

    entries.push({
      path: decoder.decode(bytes.subarray(name, name + nameSize)),
      read: async () => {
        if (
          readU32(view, local + ZipLocalOffset.SIGNATURE) !==
          ZipConfig.LOCAL_HEADER_SIGNATURE
        ) {
          throw new Error(CORRUPT_ZIP);
        }

        const start =
          local +
          ZipConfig.LOCAL_HEADER_SIZE +
          readU16(view, local + ZipLocalOffset.NAME_SIZE) +
          readU16(view, local + ZipLocalOffset.EXTRA_SIZE);

        const data = await unpack(
          bytes.subarray(start, start + packedSize),
          method,
        );

        if (crc32(data) !== crc) {
          throw new Error(CORRUPT_ZIP);
        }

        return data;
      },
    });

    offset = name + nameSize + extraSize + commentSize;
  }

  return entries;
}

export const readZipText = async (entry: ZipEntry) =>
  decoder.decode(await entry.read());
