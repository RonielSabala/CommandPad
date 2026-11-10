import { VaultField, VaultPrompt } from "./enums";

export const VaultConfig = {
  DERIVE_ALGORITHM: "PBKDF2",
  HASH_ALGORITHM: "SHA-256",
  CIPHER_ALGORITHM: "AES-GCM",
  ITERATIONS: 310_000,
  KEY_LENGTH_BITS: 256,
  SALT_BYTES: 16,
  IV_BYTES: 12,
  VERIFIER_PLAINTEXT: "commandpad-vault",
  MIN_PASSPHRASE_LENGTH: 8,
} as const;

/** The WebCrypto arguments a vault key is made with. */
export const VaultKeyUsage = {
  PASSPHRASE_FORMAT: "raw",
  EXTRACTABLE: false,
  PASSPHRASE: ["deriveKey"],
  CIPHER: ["encrypt", "decrypt"],
} as const;

/** An encrypted value reads `cpv1.<salt>.<iv>.<ciphertext>`. */
export const VaultPayload = {
  PREFIX: "cpv1",
  SEPARATOR: ".",
} as const;

export const VaultPayloadSegment = {
  PREFIX: 0,
  SALT: 1,
  IV: 2,
  CIPHERTEXT: 3,
} as const;

export const VAULT_PROMPT_FIELDS: Record<VaultPrompt, readonly VaultField[]> = {
  [VaultPrompt.CREATE]: [VaultField.NEXT, VaultField.CONFIRM],
  [VaultPrompt.UNLOCK]: [VaultField.CURRENT],
  [VaultPrompt.CHANGE]: [
    VaultField.CURRENT,
    VaultField.NEXT,
    VaultField.CONFIRM,
  ],
};
