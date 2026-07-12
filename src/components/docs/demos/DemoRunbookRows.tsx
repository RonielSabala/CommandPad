import { DragIcon, XIcon } from "@/components/icons";
import "@/components/sidebar/runbooks/RunbookRow.css";
import "@/components/sidebar/shared/SidebarSectionList.css";
import { DocsDemo } from "./DocsDemo";

const SAMPLE_RUNBOOKS = [
  { label: "Release checklist", active: true },
  { label: "postgres-backup", active: false },
];

// Non-interactive visual replica of two runbook library rows; hover a row
// to reveal its drag handle and delete button, exactly like the sidebar
export function DemoRunbookRows() {
  return (
    <DocsDemo>
      <div className="docs-demo-sidebar-frame">
        {SAMPLE_RUNBOOKS.map(({ label, active }) => (
          <div key={label} className="runbook-row sidebar-section-list-row">
            <div className="drag-handle">
              <DragIcon className="icon-md" />
            </div>
            <span className={`runbook-item-btn${active ? " active" : ""}`}>
              {label}
            </span>
            <span className="btn btn-icon btn-danger">
              <XIcon className="icon-md icon-bold" />
            </span>
          </div>
        ))}
      </div>
    </DocsDemo>
  );
}
