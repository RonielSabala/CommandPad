import { CssClass } from "@/common/constants/css";
import { useLinkModeBodyClass } from "@/hooks/useBodyClasses";
import { useLinkActivation } from "@/hooks/useLinkActivation";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useState, type ReactNode } from "react";
import { ArrowCounterclockwise } from "react-bootstrap-icons";
import "./DocsDemo.css";

interface Props {
  children: ReactNode;
  onReset: () => void;
  className?: string;
}

export function DocsDemo({ children, onReset, className }: Props) {
  const t = useTranslation();
  const [spinning, setSpinning] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useLinkActivation(root);
  useLinkModeBodyClass();

  const handleReset = () => {
    setSpinning(true);
    onReset();
  };

  return (
    <div ref={setRoot} className={classNames("docs-demo", className)}>
      <span className="docs-demo-label no-user-select">
        {t.docs.demo.tryIt}
      </span>
      <button
        className="docs-demo-reset"
        onClick={handleReset}
        title={t.docs.demo.reset}
      >
        <ArrowCounterclockwise
          className={classNames("icon", spinning && CssClass.ANIMATING)}
          onAnimationEnd={() => setSpinning(false)}
        />
      </button>
      {children}
    </div>
  );
}
