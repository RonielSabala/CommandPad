import { useTranslation } from "@/i18n";
import type { ReactNode } from "react";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import "./demos.css";

interface Props {
  children: ReactNode;
  onReset: () => void;
}

export function DocsDemo({ children, onReset }: Props) {
  const t = useTranslation();

  return (
    <div className="docs-demo">
      <span className="docs-demo-label no-user-select">
        {t.docs.demo.tryIt}
      </span>
      <button
        className="docs-demo-reset"
        onClick={onReset}
        title={t.docs.demo.reset}
      >
        <ArrowCounterclockwise className="icon" />
      </button>
      {children}
    </div>
  );
}
