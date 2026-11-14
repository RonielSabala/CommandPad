import { AppRoute } from "@/common/constants/routes";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";

import { DangerZone, DangerZoneItem } from "./parts";

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
    <DangerZone title={t.settings.dangerZone}>
      <DangerZoneItem
        title={t.settings.reset.title}
        description={t.settings.reset.description}
        action={t.settings.reset.action}
        onAction={() => void resetWorkspace()}
      />
    </DangerZone>
  );
}
