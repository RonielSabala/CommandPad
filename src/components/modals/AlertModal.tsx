import { DialogTone } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useEffect, useRef } from "react";
import { DialogModal } from "./DialogModal";

interface CachedDialog {
  message: string;
  title: string;
  tone: DialogTone;
}

export function AlertModal() {
  const t = useTranslation();
  const dialog = useStore((state) => state.alertDialog);
  const resolve = useStore((state) => state.resolveAlert);
  const open = dialog !== null;

  const okRef = useRef<HTMLButtonElement>(null);

  // Keep the last dialog rendered while the modal fades out
  const lastDialogRef = useRef<CachedDialog>({
    message: "",
    title: t.alert.defaultTitle,
    tone: DialogTone.INFO,
  });

  if (dialog) {
    lastDialogRef.current = dialog;
  }

  const { message, title, tone } = lastDialogRef.current;

  useEffect(() => {
    if (open) {
      okRef.current?.focus();
    }
  }, [open]);

  return (
    <DialogModal
      open={open}
      onClose={resolve}
      tone={tone}
      title={title}
      message={message}
    >
      <button ref={okRef} className="btn btn-lg btn-tone" onClick={resolve}>
        {t.common.ok}
      </button>
    </DialogModal>
  );
}
