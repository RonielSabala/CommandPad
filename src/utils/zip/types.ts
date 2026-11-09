export type ZipBytes = Uint8Array<ArrayBuffer>;

export interface ZipFile {
  path: string;
  data: ZipBytes;
}

/** A file in a zip being read. */
export interface ZipEntry {
  path: string;
  read: () => Promise<ZipBytes>;
}
