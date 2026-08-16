import { VaultConfig } from "@/common/config";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function fromBase64(text: string): Uint8Array {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function isVaultSupported(): boolean {
  return typeof crypto !== "undefined" && !!crypto.subtle;
}

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function randomSalt(): Uint8Array {
  return randomBytes(VaultConfig.SALT_BYTES);
}

export async function deriveVaultKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    VaultConfig.DERIVE_ALGORITHM,
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: VaultConfig.DERIVE_ALGORITHM,
      salt: salt as BufferSource,
      iterations: VaultConfig.ITERATIONS,
      hash: VaultConfig.HASH_ALGORITHM,
    },
    material,
    {
      name: VaultConfig.CIPHER_ALGORITHM,
      length: VaultConfig.KEY_LENGTH_BITS,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

export function isEncryptedValue(value: string): boolean {
  if (!value.startsWith(VaultConfig.PREFIX + VaultConfig.SEPARATOR)) {
    return false;
  }

  return (
    value.split(VaultConfig.SEPARATOR).length === VaultConfig.SEGMENT_COUNT
  );
}

export function readPayloadSalt(payload: string): string | null {
  if (!isEncryptedValue(payload)) {
    return null;
  }

  return payload.split(VaultConfig.SEPARATOR)[1];
}

export async function encryptValue(
  key: CryptoKey,
  salt: Uint8Array,
  plaintext: string,
): Promise<string> {
  const iv = randomBytes(VaultConfig.IV_BYTES);
  const ciphertext = await crypto.subtle.encrypt(
    { name: VaultConfig.CIPHER_ALGORITHM, iv: iv as BufferSource },
    key,
    encoder.encode(plaintext),
  );

  return [
    VaultConfig.PREFIX,
    toBase64(salt),
    toBase64(iv),
    toBase64(new Uint8Array(ciphertext)),
  ].join(VaultConfig.SEPARATOR);
}

export async function decryptValue(
  key: CryptoKey,
  payload: string,
): Promise<string> {
  if (!isEncryptedValue(payload)) {
    throw new Error("Not an encrypted value");
  }

  const [, , iv, ciphertext] = payload.split(VaultConfig.SEPARATOR);
  const plaintext = await crypto.subtle.decrypt(
    { name: VaultConfig.CIPHER_ALGORITHM, iv: fromBase64(iv) as BufferSource },
    key,
    fromBase64(ciphertext) as BufferSource,
  );

  return decoder.decode(plaintext);
}

export const encodeSalt = toBase64;
export const decodeSalt = fromBase64;
