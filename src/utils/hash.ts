import { sha256 as sha256Bytes } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";

/** The SHA-256 digest of `text`'s UTF-8 bytes, as lowercase hex. */
export function sha256(text: string): string {
  return bytesToHex(sha256Bytes(utf8ToBytes(text)));
}
