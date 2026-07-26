import type { CloudProvider } from "@/common/enums";
import {
  Select,
  SelectAlign,
  type SelectOption,
} from "@/components/common/Select";
import { useTranslation } from "@/i18n";
import { PROVIDER_ICON, PROVIDER_NAME, PROVIDERS } from "./cloudProviders";
import "./ProviderSelect.css";

const PROVIDER_OPTIONS: readonly SelectOption<CloudProvider>[] = PROVIDERS.map(
  (provider) => {
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
  },
);

interface ProviderSelectProps {
  provider: CloudProvider;
  onChange: (provider: CloudProvider) => void;
}

export function ProviderSelect({ provider, onChange }: ProviderSelectProps) {
  const t = useTranslation();
  const ProviderIcon = PROVIDER_ICON[provider];

  return (
    <Select
      className="provider-select"
      triggerClassName="btn provider-select-trigger"
      title={t.cloudModal.changeProvider}
      align={SelectAlign.START}
      value={provider}
      options={PROVIDER_OPTIONS}
      onChange={onChange}
    >
      <ProviderIcon className="icon-md" />
      {PROVIDER_NAME[provider]}
    </Select>
  );
}
