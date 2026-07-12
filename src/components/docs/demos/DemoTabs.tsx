import { CloseIcon } from "@/components/icons";
import "@/components/tabs/TabItem.css";
import { DocsDemo } from "./DocsDemo";

const SAMPLE_TABS = [
  { label: "deploy-checklist", active: false },
  { label: "db-backup", active: true },
  { label: "k8s-debug", active: false },
];

// Non-interactive visual replica of the tabs bar
export function DemoTabs() {
  return (
    <DocsDemo>
      <div className="docs-demo-tabs">
        {SAMPLE_TABS.map(({ label, active }) => (
          <div key={label} className={`tab${active ? " tab-active" : ""}`}>
            <span className="tab-label">{label}</span>
            {active && (
              <span className="tab-close">
                <CloseIcon className="tab-close-icon icon-sm icon-bold" />
              </span>
            )}
          </div>
        ))}
      </div>
    </DocsDemo>
  );
}
