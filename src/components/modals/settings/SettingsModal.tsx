import { CssClass } from "@/common/constants/css";
import { AriaCurrent } from "@/common/constants/dom";
import { SettingsCategory } from "@/common/enums";
import {
  CodeSquareIcon,
  KeyboardIcon,
  PaletteIcon,
  WindowSidebarIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useState, type ComponentType, type SVGProps } from "react";

import { Modal, ModalTitle } from "../Modal";
import { AppearanceSettings } from "./AppearanceSettings";
import { EditorSettings } from "./EditorSettings";
import { KeyboardSettings } from "./keyboard/KeyboardSettings";
import "./SettingsModal.css";
import { WorkspaceSettings } from "./WorkspaceSettings";

interface SettingsPageDefinition {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  Page: ComponentType;
}

const SETTINGS_PAGES: Record<SettingsCategory, SettingsPageDefinition> = {
  [SettingsCategory.APPEARANCE]: {
    icon: PaletteIcon,
    Page: AppearanceSettings,
  },
  [SettingsCategory.EDITOR]: {
    icon: CodeSquareIcon,
    Page: EditorSettings,
  },
  [SettingsCategory.KEYBOARD]: {
    icon: KeyboardIcon,
    Page: KeyboardSettings,
  },
  [SettingsCategory.WORKSPACE]: {
    icon: WindowSidebarIcon,
    Page: WorkspaceSettings,
  },
};

const SETTINGS_ICON_CLASS = classNames(CssClass.ICON, CssClass.ICON_SEMIBOLD);

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
            const { icon: Icon } = SETTINGS_PAGES[id];
            const active = id === category;

            return (
              <li key={id}>
                <button
                  className={classNames(
                    "settings-nav-item",
                    active && CssClass.ACTIVE,
                    CssClass.NO_USER_SELECT,
                  )}
                  aria-current={active ? AriaCurrent.PAGE : undefined}
                  onClick={() => setCategory(id)}
                >
                  <Icon className={SETTINGS_ICON_CLASS} />
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

        <div className="settings-page">
          <Page />
        </div>
      </section>
    </Modal>
  );
}
