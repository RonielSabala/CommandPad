import { VaultField, VaultPrompt } from "@/common/enums";
import type { RunbookContent, RunbookSync, VaultRecord } from "@/common/types";
import {
  createVault,
  decryptContent,
  decryptContentWithOpenVaults,
  decryptContentWithPassphrase,
  hasEncryptedSecrets,
  hasPlainSecrets,
  isVaultSupported,
  isVaultUnlocked,
  lockVault,
  recordFromCiphertext,
  resolveVaultStatus,
  unlockVault,
} from "@/services/vault";
import { stripJsonExtension } from "@/utils/export";

import type { StoreKit } from "@/store/kit";
import { getActiveTab } from "@/store/selectors";
import { tabContent } from "@/store/tabState";
import type { VaultPassphrases } from "@/store/types";
import type { ContentService } from "./content";
import type { EmbedState } from "./embeds";
import type { SyncService } from "./sync";

export interface ImportedVaultResult {
  content: RunbookContent;
  vault: VaultRecord | null;
  passphrase: string | null;
}

export function createVaultRecords(kit: StoreKit) {
  const { set, get, isDemo, persist } = kit;

  const getVaultRecord = (runbookId: string) =>
    (isDemo
      ? null
      : get().runbookLibrary.find((entry) => entry.id === runbookId)?.vault) ??
    null;

  const refreshVaultStatus = () =>
    set((s) => ({
      vaultStatus: Object.fromEntries(
        s.runbookLibrary.map((entry) => [
          entry.id,
          resolveVaultStatus(entry.id, entry.vault),
        ]),
      ),
    }));

  const setVaultRecord = (runbookId: string, record: VaultRecord | null) => {
    set((s) => ({
      runbookLibrary: s.runbookLibrary.map((entry) =>
        entry.id === runbookId
          ? { ...entry, vault: record ?? undefined }
          : entry,
      ),
    }));

    persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
    refreshVaultStatus();
  };

  const markRunbookSecured = (runbookId: string, secured: boolean) => {
    const entry = get().runbookLibrary.find((item) => item.id === runbookId);
    if (!entry) {
      return;
    }

    if (!secured && (entry.vault || isVaultUnlocked(runbookId))) {
      lockVault(runbookId);
      setVaultRecord(runbookId, null);
    }

    if (!!entry.secured === secured) {
      return;
    }

    set((s) => ({
      runbookLibrary: s.runbookLibrary.map((item) =>
        item.id === runbookId ? { ...item, secured } : item,
      ),
    }));

    persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
  };

  return {
    getVaultRecord,
    refreshVaultStatus,
    setVaultRecord,
    markRunbookSecured,
  };
}

export type VaultRecords = ReturnType<typeof createVaultRecords>;

export function createVaultFlows(
  kit: StoreKit,
  deps: SyncService & EmbedState & VaultRecords & ContentService,
) {
  const { set, get, isDemo, contentDb } = kit;
  const {
    flagUnsavedCloudChanges,
    setEmbeddedRunbook,
    getVaultRecord,
    refreshVaultStatus,
    setVaultRecord,
    writeRunbookContent,
  } = deps;

  /** The runbook a vault prompt acts on: whichever one is in front of you. */
  const activeVaultScope = () => getActiveTab(get())?.runbookId ?? null;

  /** Runbooks whose vault setup was declined this session. */
  const declinedVaultSetup = new Set<string>();

  const promptVault = (
    prompt: VaultPrompt,
    verify: (passphrases: VaultPassphrases) => Promise<boolean>,
    filename: string | null = null,
  ) =>
    new Promise<boolean>((resolve) => {
      if (isDemo || !isVaultSupported()) {
        resolve(false);
        return;
      }

      set({
        vaultDialog: {
          prompt,
          filename,
          error: null,
          busy: false,
          verify,
          resolve,
        },
      });
    });

  const encryptStoredRunbook = async (runbookId: string) => {
    try {
      const stored = await contentDb.get(runbookId);
      if (stored && hasPlainSecrets(stored)) {
        await writeRunbookContent(runbookId, stored);
      }
    } catch (error) {
      console.warn("Failed to encrypt stored runbook:", runbookId, error);
    }
  };

  const createVaultWith =
    (runbookId: string) => async (passphrases: VaultPassphrases) => {
      setVaultRecord(
        runbookId,
        await createVault(runbookId, passphrases[VaultField.NEXT]),
      );

      await encryptStoredRunbook(runbookId);
      flagUnsavedCloudChanges(runbookId);
      return true;
    };

  const unlockVaultWith =
    (runbookId: string) => async (passphrases: VaultPassphrases) => {
      const record = getVaultRecord(runbookId);
      if (
        !record ||
        !(await unlockVault(runbookId, passphrases[VaultField.CURRENT], record))
      ) {
        return false;
      }

      refreshVaultStatus();
      await decryptOpenTabs(runbookId);
      await decryptLoadedEmbeds();
      return true;
    };

  const changeVaultPassphraseTo =
    (runbookId: string) => async (passphrases: VaultPassphrases) => {
      const record = getVaultRecord(runbookId);
      if (
        !record ||
        !(await unlockVault(runbookId, passphrases[VaultField.CURRENT], record))
      ) {
        return false;
      }

      let plain: RunbookContent | null = null;
      try {
        plain = await contentDb.get(runbookId);
      } catch (error) {
        console.warn("Failed to read runbook for re-keying:", runbookId, error);
      }

      // An open tab may hold ciphertext it was loaded with while locked
      await decryptOpenTabs(runbookId);

      setVaultRecord(
        runbookId,
        await createVault(runbookId, passphrases[VaultField.NEXT]),
      );

      if (plain) {
        try {
          await writeRunbookContent(runbookId, plain);
        } catch (error) {
          console.warn("Failed to re-key stored runbook:", runbookId, error);
        }
      }

      flagUnsavedCloudChanges(runbookId);
      return true;
    };

  const closeVaultDialog = (unlocked: boolean) => {
    const dialog = get().vaultDialog;
    set({ vaultDialog: null });
    dialog?.resolve(unlocked);
  };

  const decryptOpenTabs = async (runbookId: string) => {
    const decrypted = await Promise.all(
      get().tabs.map(async (tab) => {
        const content = tabContent(tab);
        if (tab.runbookId !== runbookId || !hasEncryptedSecrets(content)) {
          return tab;
        }

        const result = await decryptContent(runbookId, content);
        return { ...tab, variables: result.content.variables };
      }),
    );

    set((s) => ({
      tabs: s.tabs.map(
        (tab) => decrypted.find((next) => next.id === tab.id) ?? tab,
      ),
    }));
  };

  const decryptLoadedEmbeds = async () => {
    for (const [key, entry] of Object.entries(get().embeddedRunbooks)) {
      const entryContent = entry.content;
      if (!entryContent || !hasEncryptedSecrets(entryContent)) {
        continue;
      }

      const { content } = await decryptContentWithOpenVaults(entryContent);
      if (get().embeddedRunbooks[key] === entry) {
        setEmbeddedRunbook(key, { ...entry, content });
      }
    }
  };

  const promptUnlockForActiveTab = async () => {
    const tab = getActiveTab(get());
    const runbookId = tab?.runbookId;

    if (!tab || !runbookId || !getVaultRecord(runbookId)) {
      return false;
    }

    return hasEncryptedSecrets(tabContent(tab))
      ? await promptVault(VaultPrompt.UNLOCK, unlockVaultWith(runbookId))
      : false;
  };

  const ensureVaultForSecrets = async () => {
    const runbookId = activeVaultScope();
    if (!runbookId || isVaultUnlocked(runbookId) || getVaultRecord(runbookId)) {
      return true;
    }

    if (declinedVaultSetup.has(runbookId)) {
      return false;
    }

    const created = await promptVault(
      VaultPrompt.CREATE,
      createVaultWith(runbookId),
    );

    if (!created) {
      declinedVaultSetup.add(runbookId);
    }

    return created;
  };

  const readImportedContent = async (
    content: RunbookContent,
  ): Promise<ImportedVaultResult> => {
    if (!hasEncryptedSecrets(content)) {
      return { content, vault: null, passphrase: null };
    }

    const attempt = await decryptContentWithOpenVaults(content);
    return {
      content: attempt.content,
      vault: recordFromCiphertext(content),
      passphrase: attempt.passphrase,
    };
  };

  const decryptImportedContent = async (
    content: RunbookContent,
    filename: string | null = null,
  ): Promise<ImportedVaultResult> => {
    const read = await readImportedContent(content);

    if (!hasEncryptedSecrets(read.content)) {
      return read;
    }

    let opened = read.content;
    let passphrase: string | null = null;
    await promptVault(
      VaultPrompt.UNLOCK,
      async (passphrases) => {
        const candidate = passphrases[VaultField.CURRENT];
        const result = await decryptContentWithPassphrase(
          read.content,
          candidate,
        );

        if (result.failed > 0) {
          return false;
        }

        opened = result.content;
        passphrase = candidate;
        return true;
      },
      filename,
    );

    return { content: opened, vault: read.vault, passphrase };
  };

  /** Adds a runbook read out of a cloud file, linked to the file it came from. */
  const addCloudRunbook = (
    filename: string,
    { content, vault, passphrase }: ImportedVaultResult,
    sync: RunbookSync | undefined,
  ) =>
    get().addRunbookToLibrary(
      content,
      stripJsonExtension(filename),
      filename,
      sync,
      undefined,
      vault ? { record: vault, passphrase } : undefined,
    );

  return {
    activeVaultScope,
    declinedVaultSetup,
    promptVault,
    encryptStoredRunbook,
    createVaultWith,
    unlockVaultWith,
    changeVaultPassphraseTo,
    closeVaultDialog,
    decryptOpenTabs,
    decryptLoadedEmbeds,
    promptUnlockForActiveTab,
    ensureVaultForSecrets,
    readImportedContent,
    decryptImportedContent,
    addCloudRunbook,
  };
}

export type VaultFlows = ReturnType<typeof createVaultFlows>;
