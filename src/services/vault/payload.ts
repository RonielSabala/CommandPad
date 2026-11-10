import { VaultPayload, VaultPayloadSegment } from "@/common/vaultConfig";

const PAYLOAD_START = VaultPayload.PREFIX + VaultPayload.SEPARATOR;
const SEGMENT_COUNT = Object.keys(VaultPayloadSegment).length;

export interface PayloadParts {
  salt: string;
  iv: string;
  ciphertext: string;
}

export function writePayload(parts: PayloadParts): string {
  const segments: string[] = [];
  segments[VaultPayloadSegment.PREFIX] = VaultPayload.PREFIX;
  segments[VaultPayloadSegment.SALT] = parts.salt;
  segments[VaultPayloadSegment.IV] = parts.iv;
  segments[VaultPayloadSegment.CIPHERTEXT] = parts.ciphertext;

  return segments.join(VaultPayload.SEPARATOR);
}

export function readPayload(value: string): PayloadParts | null {
  if (!value.startsWith(PAYLOAD_START)) {
    return null;
  }

  const segments = value.split(VaultPayload.SEPARATOR);
  if (segments.length !== SEGMENT_COUNT) {
    return null;
  }

  return {
    salt: segments[VaultPayloadSegment.SALT],
    iv: segments[VaultPayloadSegment.IV],
    ciphertext: segments[VaultPayloadSegment.CIPHERTEXT],
  };
}

export function isEncryptedValue(value: string): boolean {
  return readPayload(value) !== null;
}
