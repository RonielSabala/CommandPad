import { VAULT_PROMPT_FIELDS, VaultConfig } from "@/common/config";
import { VaultError, VaultField, VaultPrompt } from "@/common/enums";

import type { StoreKit } from "@/store/kit";
import type { StoreServices } from "@/store/services";
import type { StoreState } from "@/store/types";

type VaultActions = Pick<
  StoreState,
  | "requestVaultUnlock"
  | "changeVaultPassphrase"
  | "submitVaultPassphrase"
  | "dismissVaultDialog"
>;

export function createVaultSlice(
  kit: StoreKit,
  services: StoreServices,
): VaultActions {
  const { set, get } = kit;
  const {
    getVaultRecord,
    promptVault,
    createVaultWith,
    unlockVaultWith,
    changeVaultPassphraseTo,
    closeVaultDialog,
  } = services;

  return {
    requestVaultUnlock: async (runbookId) =>
      getVaultRecord(runbookId)
        ? await promptVault(VaultPrompt.UNLOCK, unlockVaultWith(runbookId))
        : await promptVault(VaultPrompt.CREATE, createVaultWith(runbookId)),

    changeVaultPassphrase: async (runbookId) =>
      getVaultRecord(runbookId)
        ? await promptVault(
            VaultPrompt.CHANGE,
            changeVaultPassphraseTo(runbookId),
          )
        : await promptVault(VaultPrompt.CREATE, createVaultWith(runbookId)),

    submitVaultPassphrase: async (passphrases) => {
      const dialog = get().vaultDialog;
      if (!dialog || dialog.busy) {
        return;
      }

      const failWith = (error: VaultError) =>
        set((s) =>
          s.vaultDialog
            ? { vaultDialog: { ...s.vaultDialog, error, busy: false } }
            : {},
        );

      // Only the boxes this prompt shows are validated
      const fields = VAULT_PROMPT_FIELDS[dialog.prompt];
      const next = passphrases[VaultField.NEXT];

      if (
        fields.includes(VaultField.NEXT) &&
        next.length < VaultConfig.MIN_PASSPHRASE_LENGTH
      ) {
        failWith(VaultError.TOO_SHORT);
        return;
      }

      if (
        fields.includes(VaultField.CONFIRM) &&
        next !== passphrases[VaultField.CONFIRM]
      ) {
        failWith(VaultError.MISMATCH);
        return;
      }

      if (
        fields.includes(VaultField.CURRENT) &&
        fields.includes(VaultField.NEXT) &&
        next === passphrases[VaultField.CURRENT]
      ) {
        failWith(VaultError.UNCHANGED);
        return;
      }

      set({ vaultDialog: { ...dialog, error: null, busy: true } });

      let accepted = false;
      try {
        accepted = await dialog.verify(passphrases);
      } catch (error) {
        console.error("Vault passphrase check failed", error);
      }

      if (!accepted) {
        failWith(VaultError.WRONG_PASSPHRASE);
        return;
      }

      set({ vaultDialog: null });
      dialog.resolve(true);

      get().saveState();
    },

    dismissVaultDialog: () => closeVaultDialog(false),
  };
}
