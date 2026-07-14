import { DragGroup } from "@/common/enums";
import { DragIcon, XIcon } from "@/components/icons";
import "@/components/sidebar/runbooks/RunbookRow.css";
import "@/components/sidebar/shared/SidebarSectionList.css";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useState } from "react";
import { DocsDemo } from "./DocsDemo";

interface DemoRunbook {
  id: string;
  label: string;
}

interface RowProps {
  runbook: DemoRunbook;
  active: boolean;
  onActivate: () => void;
  onRemove: () => void;
  onReorder: (sourceId: string, targetId: string) => void;
}

function DemoRunbookRow({
  runbook,
  active,
  onActivate,
  onRemove,
  onReorder,
}: RowProps) {
  const t = useTranslation();
  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    DragGroup.DOCS_DEMO,
    runbook.id,
    onReorder,
  );

  return (
    <div
      className={classNames(
        "runbook-row",
        "sidebar-section-list-row",
        isDragging && "dragging",
      )}
      {...rowProps}
    >
      <div
        className="drag-handle"
        title={t.common.dragToReorder}
        {...handleProps}
      >
        <DragIcon className="icon-md" />
      </div>
      <button
        className={classNames(
          "runbook-item-btn",
          active && "active",
          isDragOver && "drag-over",
        )}
        onClick={onActivate}
        title={runbook.label}
      >
        {runbook.label}
      </button>
      <button
        className="btn btn-icon btn-danger"
        onClick={onRemove}
        title={t.runbooks.removeFromLibrary}
      >
        <XIcon className="icon-md icon-bold" />
      </button>
    </div>
  );
}

// Interactive replica of the runbook library: click a row to open it,
// drag the handle to reorder, X to remove, all against local state
export function DemoRunbookRows() {
  const t = useTranslation();
  const seed = () =>
    t.docs.demo.runbookSamples.map((label, index) => ({
      id: `demo-runbook-${index}`,
      label,
    }));

  const [runbooks, setRunbooks] = useState<DemoRunbook[]>(seed);
  const [activeId, setActiveId] = useState("demo-runbook-0");

  const reorder = (sourceId: string, targetId: string) =>
    setRunbooks((current) => {
      const next = [...current];
      const from = next.findIndex((runbook) => runbook.id === sourceId);
      const to = next.findIndex((runbook) => runbook.id === targetId);
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });

  const reset = () => {
    setRunbooks(seed());
    setActiveId("demo-runbook-0");
  };

  return (
    <DocsDemo onReset={reset}>
      <div className="docs-demo-sidebar-frame">
        {runbooks.map((runbook) => (
          <DemoRunbookRow
            key={runbook.id}
            runbook={runbook}
            active={runbook.id === activeId}
            onActivate={() => setActiveId(runbook.id)}
            onRemove={() =>
              setRunbooks((current) =>
                current.filter((entry) => entry.id !== runbook.id),
              )
            }
            onReorder={reorder}
          />
        ))}
      </div>
    </DocsDemo>
  );
}
