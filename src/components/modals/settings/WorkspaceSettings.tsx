import { AppRoute } from "@/common/constants/routes";
import { SettingsCategory } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";

import { DangerZone, DangerZoneItem, SettingsPage } from "./SettingsParts";

export function WorkspaceSettings() {
  const t = useTranslation();
  const navigate = useNavigate();
  const clearAllData = useStore((state) => state.clearAllData);
  const closeSettingsModal = useStore((state) => state.closeSettingsModal);

  const resetWorkspace = async () => {
    if (await clearAllData()) {
      closeSettingsModal();
      navigate(AppRoute.HOME);
    }
  };

  return (
    <SettingsPage title={t.settings.categories[SettingsCategory.WORKSPACE]}>
      <DangerZone title={t.settings.dangerZone}>
        <DangerZoneItem
          title={t.settings.reset.title}
          description={t.settings.reset.description}
          action={t.settings.reset.action}
          onAction={() => void resetWorkspace()}
        />
      </DangerZone>
    </SettingsPage>
  );
}
