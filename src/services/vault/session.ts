import { VaultStatus } from "@/common/enums";
import type { VaultRecord } from "@/common/types";
import { VaultConfig } from "@/common/vaultConfig";

import {
  decodeSalt,
  decryptValue,
  deriveVaultKey,
  encodeSalt,
  encryptValue,
  isVaultSupported,
  randomSalt,
} from "./crypto";
import { readPayload } from "./payload";

interface VaultSession {
  key: CryptoKey;
  /** Base64, as payloads and records carry it. */
  salt: string;
  passphrase: string;
}

const sessions = new Map<string, VaultSession>();

export function getVaultSession(scope: string): VaultSession | undefined {
  return sessions.get(scope);
}

export function openVaultSessions(): VaultSession[] {
  return [...sessions.values()];
}

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
  const bytes = randomSalt();
  const salt = encodeSalt(bytes);
  const key = await deriveVaultKey(passphrase, bytes);
  sessions.set(scope, { key, salt, passphrase });

  return {
    salt,
    verifier: await encryptValue(key, salt, VaultConfig.VERIFIER_PLAINTEXT),
  };
}

export async function unlockVault(
  scope: string,
  passphrase: string,
  record: VaultRecord,
): Promise<boolean> {
  const verifier = readPayload(record.verifier);
  if (!verifier) {
    return false;
  }

  const key = await deriveVaultKey(passphrase, decodeSalt(record.salt));
  try {
    await decryptValue(key, verifier);
  } catch {
    return false;
  }

  sessions.set(scope, { key, salt: record.salt, passphrase });
  return true;
}

/**  Opens `scope` with a session that is already holding this record's salt. */
export function adoptOpenVault(scope: string, record: VaultRecord): boolean {
  for (const session of sessions.values()) {
    if (session.salt === record.salt) {
      sessions.set(scope, session);
      return true;
    }
  }

  return false;
}
