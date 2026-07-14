import { MouseButton } from "@/common/constants/events";
import { NoteStyle } from "@/common/enums";
import { CloseIcon } from "@/components/icons";
import "@/components/tabs/TabItem.css";
import { useTranslation } from "@/i18n";
import { useState, type DragEvent } from "react";
import { DemoNoteBlock } from "./DemoNoteBlock";
import { DocsDemo } from "./DocsDemo";

interface DemoTab {
  id: number;
  note: string;
}

// Interactive replica of the tabs bar: click to switch, middle-click or X
// to close, drag to reorder. The note below belongs to the active tab and
// renames it live, mirroring the first-note-labels-the-tab behavior.
export function DemoTabs() {
  const t = useTranslation();
  const [tabs, setTabs] = useState<DemoTab[]>(() =>
    t.docs.demo.tabSamples.map((note, index) => ({ id: index, note })),
  );
  const [activeId, setActiveId] = useState(0);
  const [dragId, setDragId] = useState<number | null>(null);

  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  const label = (tab: DemoTab) =>
    tab.note.split("\n")[0].trim() || t.common.untitledTab;

  const closeTab = (id: number) =>
    setTabs((current) => current.filter((tab) => tab.id !== id));

  const moveTab = (targetId: number) => {
    if (dragId === null || dragId === targetId) {
      return;
    }

    setTabs((current) => {
      const next = [...current];
      const from = next.findIndex((tab) => tab.id === dragId);
      const to = next.findIndex((tab) => tab.id === targetId);
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
  };

  const resetTabs = () => {
    setTabs(t.docs.demo.tabSamples.map((note, index) => ({ id: index, note })));
    setActiveId(0);
  };

  return (
    <DocsDemo onReset={resetTabs}>
      <div className="docs-demo-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab${activeTab && tab.id === activeTab.id ? " tab-active" : ""}`}
            draggable
            onClick={() => setActiveId(tab.id)}
            onMouseDown={(event) => {
              if (event.button === MouseButton.MIDDLE) {
                event.preventDefault();
                closeTab(tab.id);
              }
            }}
            onDragStart={() => setDragId(tab.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(event: DragEvent) => {
              event.preventDefault();
              moveTab(tab.id);
            }}
          >
            <span className="tab-label">{label(tab)}</span>
            <button
              className="tab-close"
              title={t.tabs.closeTab}
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <CloseIcon className="tab-close-icon icon-sm icon-bold" />
            </button>
          </div>
        ))}
      </div>
      {activeTab && (
        <div className="docs-demo-tab-panel">
          <DemoNoteBlock
            key={activeTab.id}
            text={activeTab.note}
            onTextChange={(value) =>
              setTabs((current) =>
                current.map((tab) =>
                  tab.id === activeTab.id ? { ...tab, note: value } : tab,
                ),
              )
            }
            initialStyle={NoteStyle.HEADING}
            showStyleRow={false}
          />
        </div>
      )}
    </DocsDemo>
  );
}
