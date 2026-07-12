import { useTranslation } from "@/i18n";
import type { ReactNode } from "react";
import "./demos.css";

// Framed live example; children are store-free replicas of real components
export function DocsDemo({ children }: { children: ReactNode }) {
  const t = useTranslation();
  return (
    <div className="docs-demo">
      <span className="docs-demo-label no-user-select">{t.docs.demo.tryIt}</span>
      {children}
    </div>
  );
}
