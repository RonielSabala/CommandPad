import type { SyncDestination } from "@/common/enums";
import { MessageSlot, splitAtSlot } from "@/i18n";
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
    <div className="modal-title">
      {before}
      <ProviderSelect provider={provider} onChange={onChange} />
      {after}
    </div>
  );
}
