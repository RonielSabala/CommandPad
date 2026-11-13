import { CssClass } from "@/common/constants/css";
import { AriaCurrent } from "@/common/constants/dom";
import { SettingsCategory } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useState, type ComponentType, type SVGProps } from "react";
import { DatabaseFill, PaletteFill } from "react-bootstrap-icons";

import { Modal, ModalTitle } from "../Modal";
import { AppearanceSettings } from "./AppearanceSettings";
import "./SettingsModal.css";
import { WorkspaceSettings } from "./WorkspaceSettings";

interface SettingsPageDefinition {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  Page: ComponentType;
}

const SETTINGS_PAGES: Record<SettingsCategory, SettingsPageDefinition> = {
  [SettingsCategory.APPEARANCE]: {
    icon: PaletteFill,
    Page: AppearanceSettings,
  },
  [SettingsCategory.WORKSPACE]: {
    icon: DatabaseFill,
    Page: WorkspaceSettings,
  },
};

const CATEGORY_ORDER = Object.values(SettingsCategory);

export function SettingsModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.settingsModalOpen);
  const onClose = useStore((state) => state.closeSettingsModal);
  const [category, setCategory] = useState<SettingsCategory>(
    SettingsCategory.APPEARANCE,
  );

  const { Page } = SETTINGS_PAGES[category];

  return (
    <Modal open={isOpen} onClose={onClose} className="modal-settings">
      <nav className="settings-nav" aria-label={t.settings.title}>
        <ModalTitle className="settings-title">{t.settings.title}</ModalTitle>

        <ul className="settings-nav-list">
          {CATEGORY_ORDER.map((id) => {
            const Icon = SETTINGS_PAGES[id].icon;
            const active = id === category;

            return (
              <li key={id}>
                <button
                  className={classNames(
                    "settings-nav-item",
                    active && CssClass.ACTIVE,
                  )}
                  aria-current={active ? AriaCurrent.PAGE : undefined}
                  onClick={() => setCategory(id)}
                >
                  <Icon className={CssClass.ICON} />
                  {t.settings.categories[id]}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="settings-content">
        <h2 className="settings-page-title">
          {t.settings.categories[category]}
        </h2>
        <Page />
      </section>
    </Modal>
  );
}
