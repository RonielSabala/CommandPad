import { DialogTone } from "@/common/enums";
import { getMessages } from "@/i18n/messages";

import type { StoreKit } from "@/store/kit";
import type { StoreState } from "@/store/types";

type DialogsActions = Pick<
  StoreState,
  "confirm" | "resolveConfirm" | "alert" | "resolveAlert"
>;

export function createDialogsSlice(kit: StoreKit): DialogsActions {
  const { set, get, isDemo } = kit;

  return {
    confirm: (message, options) => {
      // Demo stores have no modals mounted; treat every confirm as accepted
      if (isDemo) {
        return Promise.resolve(true);
      }

      return new Promise<boolean>((resolve) => {
        const defaultLabel = getMessages(get().language).confirm.defaultTitle;
        set({
          confirmDialog: {
            message,
            resolve,
            title: options?.title ?? defaultLabel,
            confirmLabel: options?.confirmLabel ?? defaultLabel,
            tone: options?.tone ?? DialogTone.INFO,
          },
        });
      });
    },
    resolveConfirm: (result) => {
      get().confirmDialog?.resolve(result);
      set({ confirmDialog: null });
    },
    alert: (message, options) => {
      if (isDemo) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const defaultTitle = getMessages(get().language).alert.defaultTitle;
        set({
          alertDialog: {
            message,
            resolve,
            title: options?.title ?? defaultTitle,
            tone: options?.tone ?? DialogTone.INFO,
          },
        });
      });
    },
    resolveAlert: () => {
      get().alertDialog?.resolve();
      set({ alertDialog: null });
    },
  };
}
