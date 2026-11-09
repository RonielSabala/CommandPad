import {
  ZipCentralOffset,
  ZipConfig,
  ZipEndOffset,
  ZipLocalOffset,
} from "@/common/zipFormat";

import { readU16, readU32 } from "./binary";
import { crc32 } from "./crc32";
import type { ZipBytes, ZipEntry } from "./types";

const decoder = new TextDecoder();
const CORRUPT_ZIP = "Corrupt zip archive";

// Utils

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
