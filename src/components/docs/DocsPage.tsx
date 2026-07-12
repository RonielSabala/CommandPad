import { DocsHeader } from "./DocsHeader";
import "./DocsPage.css";

export function DocsPage() {
  return (
    <div className="docs-shell">
      <DocsHeader />
      <main className="docs-main" />
    </div>
  );
}
