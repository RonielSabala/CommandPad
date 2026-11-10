export const ZipConfig = {
  LOCAL_HEADER_SIGNATURE: 0x04034b50,
  CENTRAL_HEADER_SIGNATURE: 0x02014b50,
  END_RECORD_SIGNATURE: 0x06054b50,
  LOCAL_HEADER_SIZE: 30,
  CENTRAL_HEADER_SIZE: 46,
  END_RECORD_SIZE: 22,
  VERSION: 20,
  UTF8_FLAG: 0x0800,
  STORED_METHOD: 0,
  DEFLATED_METHOD: 8,
  DEFLATE_FORMAT: "deflate-raw",
  MAX_COMMENT_SIZE: 0xffff,
  LITTLE_ENDIAN: true,
  BITS_PER_BYTE: 8,
  BYTE_MASK: 0xff,
  CRC_POLYNOMIAL: 0xedb88320,
  CRC_SEED: 0xffffffff,
  CRC_TABLE_SIZE: 256,
} as const;

/** Where each field sits in a local file header. */
export const ZipLocalOffset = {
  SIGNATURE: 0,
  VERSION_NEEDED: 4,
  FLAGS: 6,
  METHOD: 8,
  TIME: 10,
  DATE: 12,
  CRC: 14,
  PACKED_SIZE: 18,
  SIZE: 22,
  NAME_SIZE: 26,
  EXTRA_SIZE: 28,
} as const;

/** Where each field sits in a central directory header. */
export const ZipCentralOffset = {
  SIGNATURE: 0,
  VERSION_MADE_BY: 4,
  VERSION_NEEDED: 6,
  FLAGS: 8,
  METHOD: 10,
  TIME: 12,
  DATE: 14,
  CRC: 16,
  PACKED_SIZE: 20,
  SIZE: 24,
  NAME_SIZE: 28,
  EXTRA_SIZE: 30,
  COMMENT_SIZE: 32,
  LOCAL_OFFSET: 42,
} as const;

/** Where each field sits in the end of central directory record. */
export const ZipEndOffset = {
  SIGNATURE: 0,
  DISK_ENTRY_COUNT: 8,
  ENTRY_COUNT: 10,
  CENTRAL_SIZE: 12,
  CENTRAL_OFFSET: 16,
} as const;

/** How a date and time pack into a zip's two 16-bit DOS fields. */
export const ZipDosTime = {
  EPOCH_YEAR: 1980,
  YEAR_SHIFT: 9,
  MONTH_SHIFT: 5,
  /** DOS counts months from 1, `Date` from 0. */
  MONTH_BASE: 1,
  HOUR_SHIFT: 11,
  MINUTE_SHIFT: 5,
  /** DOS stores seconds in units of two. */
  SECOND_SHIFT: 1,
} as const;
