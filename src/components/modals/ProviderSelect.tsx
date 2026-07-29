import { SyncDestination } from "@/common/enums";
import {
  Select,
  SelectAlign,
  type SelectOption,
} from "@/components/common/Select";
import { useTranslation } from "@/i18n";
import { LaptopFill } from "react-bootstrap-icons";
import { PROVIDER_ICON, PROVIDER_NAME, PROVIDERS } from "./cloudProviders";
import "./ProviderSelect.css";

interface ProviderSelectProps {
  provider: SyncDestination;
  onChange: (destination: SyncDestination) => void;
}

export function ProviderSelect({ provider, onChange }: ProviderSelectProps) {
  const t = useTranslation();
  const options: readonly SelectOption<SyncDestination>[] = [
    {
      value: SyncDestination.LOCAL,
      label: (
        <>
          <LaptopFill className="icon-md" />
          {t.destinationModal.local}
        </>
      ),
    },
    ...PROVIDERS.map((provider) => {
      const ProviderIcon = PROVIDER_ICON[provider];
      return {
        value: provider,
        label: (
          <>
            <ProviderIcon className="icon-md" />
            {PROVIDER_NAME[provider]}
          </>
        ),
      };
    }),
  ];

  const ProviderIcon =
    provider === SyncDestination.LOCAL ? LaptopFill : PROVIDER_ICON[provider];
  const label =
    provider === SyncDestination.LOCAL
      ? t.destinationModal.local
      : PROVIDER_NAME[provider];

  return (
    <Select
      className="provider-select"
      triggerClassName="btn provider-select-trigger"
      title={t.cloudModal.changeProvider}
      align={SelectAlign.START}
      value={provider}
      options={options}
      onChange={onChange}
    >
      <ProviderIcon className="icon-md" />
      {label}
    </Select>
  );
}
