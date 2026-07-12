import { KeyBinding } from "@/common/keybindings";
import { useTranslation } from "@/i18n";
import { Kbd, Prose, ProseList } from "../Prose";

export function WorkspaceDocs() {
  const t = useTranslation();
  return <Prose text={t.docs.workspace.intro} />;
}

export function TabsDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.tabs.intro} />
      <ProseList items={t.docs.tabs.items} />
    </>
  );
}

export function SidebarDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.sidebar.intro} />
      <ProseList items={t.docs.sidebar.items} />
      <p className="docs-prose docs-kbd-row">
        <Kbd binding={KeyBinding.TOGGLE_SIDEBAR} />
        <span>{t.keybindings[KeyBinding.TOGGLE_SIDEBAR]}</span>
      </p>
      <p className="docs-prose docs-kbd-row">
        <Kbd binding={KeyBinding.MOVE_SIDEBAR} />
        <span>{t.keybindings[KeyBinding.MOVE_SIDEBAR]}</span>
      </p>
    </>
  );
}

export function RunbookLibraryDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.runbookLibrary.intro} />
      <ProseList items={t.docs.runbookLibrary.items} />
      <Prose text={t.docs.runbookLibrary.autoLabel} />
      <Prose text={t.docs.runbookLibrary.autoSave} />
    </>
  );
}
