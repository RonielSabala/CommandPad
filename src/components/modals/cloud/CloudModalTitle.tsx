import type { SyncDestination } from "@/common/enums";
import { MessageSlot, splitAtSlot } from "@/i18n";
import { ModalTitle } from "../Modal";
import { ProviderSelect } from "./ProviderSelect";

interface CloudModalTitleProps {
  message: string;
  provider: SyncDestination;
  onChange: (destination: SyncDestination) => void;
}

export function CloudModalTitle({
  message,
  provider,
  onChange,
}: CloudModalTitleProps) {
  const [before, after] = splitAtSlot(message, MessageSlot.PROVIDER);

  return (
    <ModalTitle>
      {before}
      <ProviderSelect provider={provider} onChange={onChange} />
      {after}
    </ModalTitle>
  );
}
