import { VaultConfig, VaultKeyUsage } from "@/common/vaultConfig";

import { fromBase64, toBase64 } from "./base64";
import { writePayload, type PayloadParts } from "./payload";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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
    VaultKeyUsage.PASSPHRASE_FORMAT,
    encoder.encode(passphrase),
    VaultConfig.DERIVE_ALGORITHM,
    VaultKeyUsage.EXTRACTABLE,
    VaultKeyUsage.PASSPHRASE,
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
    VaultKeyUsage.EXTRACTABLE,
    VaultKeyUsage.CIPHER,
  );
}

export async function encryptValue(
  key: CryptoKey,
  salt: string,
  plaintext: string,
): Promise<string> {
  const iv = randomBytes(VaultConfig.IV_BYTES);
  const ciphertext = await crypto.subtle.encrypt(
    { name: VaultConfig.CIPHER_ALGORITHM, iv: iv as BufferSource },
    key,
    encoder.encode(plaintext),
  );

  return writePayload({
    salt,
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  });
}

export async function decryptValue(
  key: CryptoKey,
  parts: PayloadParts,
): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    {
      name: VaultConfig.CIPHER_ALGORITHM,
      iv: fromBase64(parts.iv) as BufferSource,
    },
    key,
    fromBase64(parts.ciphertext) as BufferSource,
  );

  return decoder.decode(plaintext);
}

export const encodeSalt = toBase64;
export const decodeSalt = fromBase64;
