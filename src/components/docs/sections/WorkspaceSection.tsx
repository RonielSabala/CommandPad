import { KeyBinding } from "@/common/keybindings";
import { useTranslation } from "@/i18n";

import { Prose } from "../Prose";
import { useShortcutLabel } from "../useShortcutLabel";

export function WorkspaceDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.workspace.intro} />
      <Prose text={t.docs.workspace.items} />
      <Prose text={t.docs.workspace.persistence} />
    </>
  );
}

export function HeaderDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.header.intro} />
      <Prose
        text={t.docs.header.items(t.header.export, t.header.collapseAll)}
      />
    </>
  );
}

export function MainPanelDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.mainPanel.intro(t.blocks.newBlockLabel)} />
      <Prose text={t.docs.mainPanel.minimap} />
    </>
  );
}

export function SidebarDocs() {
  const t = useTranslation();
  const sidebarKey = useShortcutLabel(KeyBinding.TOGGLE_SIDEBAR);

  return (
    <>
      <Prose text={t.docs.sidebar.intro} />
      <Prose text={t.docs.sidebar.items(sidebarKey)} />
      <Prose text={t.docs.sidebar.resizeDetails} />
    </>
  );
}
