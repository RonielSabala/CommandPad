import { MimeType } from "@/common/config";
import {
  ZipCentralOffset,
  ZipConfig,
  ZipDosTime,
  ZipEndOffset,
  ZipLocalOffset,
} from "@/common/zipFormat";

import { writeU16, writeU32 } from "./binary";
import { crc32 } from "./crc32";
import type { ZipBytes, ZipFile } from "./types";

const encoder = new TextEncoder();
const EMPTY_DATA = new Uint8Array(0);

// Utils

export function textZipFile(path: string, text: string): ZipFile {
  return { path, data: encoder.encode(text) };
}

export function emptyZipFolder(path: string): ZipFile {
  return { path, data: EMPTY_DATA };
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
