import { memo } from 'react';

import { CssClass } from '@/common/constants/css';
import { DataAttr } from '@/common/constants/dom';
import { AppMode } from '@/common/enums';
import type { RunbookEntry } from '@/common/types';
import { useStore } from '@/store/store';
import { useRowReorder } from '@/hooks/useRowReorder';
import { DragDotsIcon, TrashIcon } from '../Icons';

export const RunbookRow = memo(function RunbookRow({ runbook }: { runbook: RunbookEntry }) {
  const active = useStore((s) => s.activeRunbookId === runbook.id);
  const focused = useStore((s) => s.focusedRunbookId === runbook.id);
  const readMode = useStore((s) => s.mode === AppMode.READ);
  const setRunbookFocus = useStore((s) => s.setRunbookFocus);
  const loadRunbookFromLibrary = useStore((s) => s.loadRunbookFromLibrary);
  const removeRunbookFromLibrary = useStore((s) => s.removeRunbookFromLibrary);
  const reorderRunbooks = useStore((s) => s.reorderRunbooks);

  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    'runbook',
    runbook.id,
    reorderRunbooks,
    !readMode,
  );

  const btnClass = [
    'runbook-item-btn',
    active && CssClass.ACTIVE,
    focused && CssClass.RUNBOOK_FOCUSED,
    isDragOver && CssClass.DRAG_OVER,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`sidebar-section-row${isDragging ? ' dragging' : ''}`}
      {...{ [DataAttr.RUNBOOK_ID]: runbook.id }}
      {...rowProps}
    >
      <div className="runbook-drag-handle drag-handle" title="Drag to reorder" {...handleProps}>
        <DragDotsIcon />
      </div>
      <button
        className={btnClass}
        onClick={() => {
          setRunbookFocus(null);
          void loadRunbookFromLibrary(runbook.id);
        }}
        title={runbook.label}
      >
        {runbook.label}
      </button>
      <button
        className="btn btn-icon btn-danger"
        onClick={() => void removeRunbookFromLibrary(runbook.id)}
        title="Remove from library"
      >
        <TrashIcon />
      </button>
    </div>
  );
});
