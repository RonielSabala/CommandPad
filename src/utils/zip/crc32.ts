import { ZipConfig } from "@/common/zipFormat";

import type { ZipBytes } from "./types";

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

export function crc32(data: ZipBytes): number {
  let crc: number = ZipConfig.CRC_SEED;

  for (const byte of data) {
    crc =
      CRC_TABLE[(crc ^ byte) & ZipConfig.BYTE_MASK] ^
      (crc >>> ZipConfig.BITS_PER_BYTE);
  }

  return (crc ^ ZipConfig.CRC_SEED) >>> 0;
}
