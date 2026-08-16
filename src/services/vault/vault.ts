import { VaultConfig } from "@/common/config";
import { VaultStatus } from "@/common/enums";
import type { RunbookContent, Variable, VaultRecord } from "@/common/types";
import {
  decodeSalt,
  decryptValue,
  deriveVaultKey,
  encodeSalt,
  encryptValue,
  isEncryptedValue,
  isVaultSupported,
  randomSalt,
  readPayloadSalt,
} from "./crypto";

interface VaultSession {
  key: CryptoKey;
  salt: Uint8Array;
}

const sessions = new Map<string, VaultSession>();

export function isVaultUnlocked(scope: string): boolean {
  return sessions.has(scope);
}

export function lockVault(scope?: string): void {
  if (scope === undefined) {
    sessions.clear();
    return;
  }

  sessions.delete(scope);
}

export function resolveVaultStatus(
  scope: string,
  record: VaultRecord | null | undefined,
): VaultStatus {
  if (!isVaultSupported()) {
    return VaultStatus.UNSUPPORTED;
  }

  if (!record) {
    return VaultStatus.ABSENT;
  }

  return sessions.has(scope) ? VaultStatus.UNLOCKED : VaultStatus.LOCKED;
}

export async function createVault(
  scope: string,
  passphrase: string,
): Promise<VaultRecord> {
  const salt = randomSalt();
  const key = await deriveVaultKey(passphrase, salt);
  sessions.set(scope, { key, salt });

  return {
    salt: encodeSalt(salt),
    verifier: await encryptValue(key, salt, VaultConfig.VERIFIER_PLAINTEXT),
  };
}

export async function unlockVault(
  scope: string,
  passphrase: string,
  record: VaultRecord,
): Promise<boolean> {
  const salt = decodeSalt(record.salt);
  const key = await deriveVaultKey(passphrase, salt);

  try {
    const verified = await decryptValue(key, record.verifier);
    if (verified !== VaultConfig.VERIFIER_PLAINTEXT) {
      return false;
    }
  } catch {
    return false;
  }

  sessions.set(scope, { key, salt });
  return true;
}

// --- Content transforms ---

const isSecretVariable = (variable: Variable) =>
  !!variable.secret && variable.value.length > 0;

export function holdsSecrets(content: RunbookContent): boolean {
  return (content.variables ?? []).some(
    (variable) =>
      isSecretVariable(variable) || isEncryptedValue(variable.value),
  );
}

export function hasPlainSecrets(content: RunbookContent): boolean {
  return (content.variables ?? []).some(
    (variable) =>
      isSecretVariable(variable) && !isEncryptedValue(variable.value),
  );
}

export function countEncryptedSecrets(content: RunbookContent): number {
  return (content.variables ?? []).filter((variable) =>
    isEncryptedValue(variable.value),
  ).length;
}

async function mapVariables(
  content: RunbookContent,
  transform: (variable: Variable) => Promise<Variable>,
): Promise<RunbookContent> {
  return {
    ...content,
    variables: await Promise.all((content.variables ?? []).map(transform)),
  };
}

export async function encryptContent(
  scope: string,
  content: RunbookContent,
): Promise<RunbookContent> {
  const open = sessions.get(scope);
  if (!open || !hasPlainSecrets(content)) {
    return content;
  }

  return mapVariables(content, async (variable) =>
    isSecretVariable(variable) && !isEncryptedValue(variable.value)
      ? {
          ...variable,
          value: await encryptValue(open.key, open.salt, variable.value),
        }
      : variable,
  );
}

export interface DecryptResult {
  content: RunbookContent;
  /** Values that stayed ciphertext because no key opened them */
  failed: number;
}

async function decryptWith(
  content: RunbookContent,
  keyForValue: (value: string) => Promise<CryptoKey | null>,
): Promise<DecryptResult> {
  let failed = 0;

  const decrypted = await mapVariables(content, async (variable) => {
    const variableValue = variable.value;
    if (!isEncryptedValue(variableValue)) {
      return variable;
    }

    try {
      const key = await keyForValue(variableValue);
      if (!key) {
        failed += 1;
        return variable;
      }

      return { ...variable, value: await decryptValue(key, variableValue) };
    } catch {
      failed += 1;
      return variable;
    }
  });

  return { content: decrypted, failed };
}

export async function decryptContent(
  scope: string,
  content: RunbookContent,
): Promise<DecryptResult> {
  const open = sessions.get(scope);
  if (!open) {
    return { content, failed: countEncryptedSecrets(content) };
  }

  return decryptWith(content, async () => open.key);
}

/**
 * Decrypts against whichever vault is already open, matching each payload to a
 * session by the salt it carries.
 */
export async function decryptContentWithOpenVaults(
  content: RunbookContent,
): Promise<DecryptResult> {
  const keysBySalt = new Map<string, CryptoKey>();

  for (const { key, salt } of sessions.values()) {
    keysBySalt.set(encodeSalt(salt), key);
  }

  return decryptWith(content, async (value) => {
    const salt = readPayloadSalt(value);
    return (salt && keysBySalt.get(salt)) || null;
  });
}

/**
 * Decrypts an imported file against a passphrase the user just typed, deriving
 * one key per salt the file carries.
 */
export async function decryptContentWithPassphrase(
  content: RunbookContent,
  passphrase: string,
): Promise<DecryptResult> {
  const keysBySalt = new Map<string, CryptoKey>();

  return decryptWith(content, async (value) => {
    const salt = readPayloadSalt(value);
    if (!salt) {
      return null;
    }

    const cached = keysBySalt.get(salt);
    if (cached) {
      return cached;
    }

    const key = await deriveVaultKey(passphrase, decodeSalt(salt));
    keysBySalt.set(salt, key);

    return key;
  });
}
