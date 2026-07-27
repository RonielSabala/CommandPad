import { MimeType, ZipConfig } from "@/common/config";

type ZipBytes = Uint8Array<ArrayBuffer>;

export interface ZipFile {
  path: string;
  data: ZipBytes;
}

const encoder = new TextEncoder();
const CRC_TABLE = (() => {
  const table = new Uint32Array(ZipConfig.CRC_TABLE_SIZE);

  for (let index = 0; index < table.length; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
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
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ ZipConfig.CRC_SEED) >>> 0;
}

function dosDateTime(date: Date): { time: number; date: number } {
  const year = Math.max(date.getFullYear(), ZipConfig.DOS_EPOCH_YEAR);

  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      (date.getSeconds() >> 1),
    date:
      ((year - ZipConfig.DOS_EPOCH_YEAR) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  };
}

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
    localView.setUint32(0, ZipConfig.LOCAL_HEADER_SIGNATURE, true);
    localView.setUint16(4, ZipConfig.VERSION, true);
    localView.setUint16(6, ZipConfig.UTF8_FLAG, true);
    localView.setUint16(8, ZipConfig.STORED_METHOD, true);
    localView.setUint16(10, stamp.time, true);
    localView.setUint16(12, stamp.date, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, size, true);
    localView.setUint32(22, size, true);
    localView.setUint16(26, name.length, true);
    local.set(name, ZipConfig.LOCAL_HEADER_SIZE);

    const entry = new Uint8Array(ZipConfig.CENTRAL_HEADER_SIZE + name.length);
    const entryView = new DataView(entry.buffer);
    entryView.setUint32(0, ZipConfig.CENTRAL_HEADER_SIGNATURE, true);
    entryView.setUint16(4, ZipConfig.VERSION, true);
    entryView.setUint16(6, ZipConfig.VERSION, true);
    entryView.setUint16(8, ZipConfig.UTF8_FLAG, true);
    entryView.setUint16(10, ZipConfig.STORED_METHOD, true);
    entryView.setUint16(12, stamp.time, true);
    entryView.setUint16(14, stamp.date, true);
    entryView.setUint32(16, crc, true);
    entryView.setUint32(20, size, true);
    entryView.setUint32(24, size, true);
    entryView.setUint16(28, name.length, true);
    entryView.setUint32(42, offset, true);
    entry.set(name, ZipConfig.CENTRAL_HEADER_SIZE);

    locals.push(local, file.data);
    central.push(entry);
    offset += local.length + size;
  }

  const centralSize = central.reduce((total, entry) => total + entry.length, 0);

  const end = new Uint8Array(ZipConfig.END_RECORD_SIZE);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, ZipConfig.END_RECORD_SIGNATURE, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return new Blob([...locals, ...central, end], { type: MimeType.ZIP });
}
