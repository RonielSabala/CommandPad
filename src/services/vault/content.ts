import type { RunbookContent, Variable, VaultRecord } from "@/common/types";

import {
  decodeSalt,
  decryptValue,
  deriveVaultKey,
  encryptValue,
} from "./crypto";
import { isEncryptedValue, readPayload } from "./payload";
import { getVaultSession, openVaultSessions } from "./session";

export function recordFromCiphertext(
  content: RunbookContent,
): VaultRecord | null {
  for (const { value } of content.variables ?? []) {
    const parts = readPayload(value);
    if (parts) {
      return { salt: parts.salt, verifier: value };
    }
  }

  return null;
}

const isSecretVariable = (variable: Variable) =>
  !!variable.secret && variable.value.length > 0;

const isPlainSecret = (variable: Variable) =>
  isSecretVariable(variable) && !isEncryptedValue(variable.value);

export function holdsSecrets(content: RunbookContent): boolean {
  return (content.variables ?? []).some(
    (variable) =>
      isSecretVariable(variable) || isEncryptedValue(variable.value),
  );
}

export function hasPlainSecrets(content: RunbookContent): boolean {
  return (content.variables ?? []).some(isPlainSecret);
}

export function hasEncryptedSecrets(content: RunbookContent): boolean {
  return (content.variables ?? []).some((variable) =>
    isEncryptedValue(variable.value),
  );
}

function countEncryptedSecrets(content: RunbookContent): number {
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
  const open = getVaultSession(scope);
  if (!open || !hasPlainSecrets(content)) {
    return content;
  }

  return mapVariables(content, async (variable) =>
    isPlainSecret(variable)
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
  keyForSalt: (salt: string) => Promise<CryptoKey | null>,
): Promise<DecryptResult> {
  let failed = 0;

  const decrypted = await mapVariables(content, async (variable) => {
    const parts = readPayload(variable.value);
    if (!parts) {
      return variable;
    }

    try {
      const key = await keyForSalt(parts.salt);
      if (!key) {
        failed += 1;
        return variable;
      }

      return { ...variable, value: await decryptValue(key, parts) };
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
  const open = getVaultSession(scope);
  if (!open) {
    return { content, failed: countEncryptedSecrets(content) };
  }

  return decryptWith(content, async () => open.key);
}

export interface OpenVaultDecryptResult extends DecryptResult {
  /** The open vault's passphrase that opened the file, when a salt did not. */
  passphrase: string | null;
}

/**
 * Decrypts against whichever vault is already open: first by matching each
 * payload to a session by the salt it carries, then by retrying the passphrases
 * those sessions were opened with.
 */
export async function decryptContentWithOpenVaults(
  content: RunbookContent,
): Promise<OpenVaultDecryptResult> {
  const sessions = openVaultSessions();
  const keysBySalt = new Map(sessions.map(({ salt, key }) => [salt, key]));

  const bySalt = await decryptWith(
    content,
    async (salt) => keysBySalt.get(salt) ?? null,
  );

  if (bySalt.failed > 0) {
    const openPassphrases = new Set(
      sessions.map((session) => session.passphrase),
    );

    for (const passphrase of openPassphrases) {
      const attempt = await decryptContentWithPassphrase(
        bySalt.content,
        passphrase,
      );

      if (attempt.failed === 0) {
        return { ...attempt, passphrase };
      }
    }
  }

  return { ...bySalt, passphrase: null };
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

  return decryptWith(content, async (salt) => {
    const cached = keysBySalt.get(salt);
    if (cached) {
      return cached;
    }

    const key = await deriveVaultKey(passphrase, decodeSalt(salt));
    keysBySalt.set(salt, key);

    return key;
  });
}
