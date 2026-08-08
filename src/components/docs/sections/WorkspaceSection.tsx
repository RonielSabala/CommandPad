import { useTranslation } from "@/i18n";
import { Prose, ProseList } from "../Prose";

export function WorkspaceDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.workspace.intro} />
      <ProseList items={t.docs.workspace.items} />
      <Prose text={t.docs.workspace.persistence} />
    </>
  );
}

export function HeaderDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.header.intro} />
      <ProseList items={t.docs.header.items(t.header.export)} />
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

  return (
    <>
      <Prose text={t.docs.sidebar.intro} />
      <ProseList items={t.docs.sidebar.items} />
      <Prose text={t.docs.sidebar.resizeDetails} />
    </>
  );
}
