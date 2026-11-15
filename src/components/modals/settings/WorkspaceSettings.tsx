import { QuickOpenRecents } from "@/common/config";
import { AppRoute } from "@/common/constants/routes";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";

import { DangerZone, DangerZoneItem, SettingItem, SettingRange } from "./parts";

export function WorkspaceSettings() {
  const t = useTranslation();
  const navigate = useNavigate();
  const recents = useStore((state) => state.quickOpenRecents);
  const setRecents = useStore((state) => state.setQuickOpenRecents);
  const clearAllData = useStore((state) => state.clearAllData);
  const closeSettingsModal = useStore((state) => state.closeSettingsModal);

  const { quickOpenRecents } = t.settings;
  const resetWorkspace = async () => {
    if (await clearAllData()) {
      closeSettingsModal();
      navigate(AppRoute.HOME);
    }
  };

  return (
    <>
      <SettingItem
        title={quickOpenRecents.title}
        description={quickOpenRecents.description}
      >
        <SettingRange
          label={quickOpenRecents.title}
          value={recents}
          defaultValue={QuickOpenRecents.DEFAULT}
          min={QuickOpenRecents.MIN}
          max={QuickOpenRecents.MAX}
          step={QuickOpenRecents.STEP}
          valueText={quickOpenRecents.value(recents)}
          onChange={setRecents}
        />
      </SettingItem>

      <DangerZone title={t.settings.dangerZone}>
        <DangerZoneItem
          title={t.settings.reset.title}
          description={t.settings.reset.description}
          action={t.settings.reset.action}
          onAction={() => void resetWorkspace()}
        />
      </DangerZone>
    </>
  );
}
