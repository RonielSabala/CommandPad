import { CodeModelScope } from "@/common/editorConfig";
import { AppMode, CodeLanguage, PanelSide } from "@/common/enums";
import { CodeEditor } from "@/components/common/codeEditor/CodeEditor";
import { useTranslation } from "@/i18n";
import { getActiveTab, useStore } from "@/store/store";
import { buildRunbookSource } from "@/utils/runbookSource";
import { useMemo, useState } from "react";
import "./RunbookSource.css";

export function RunbookSource() {
  const t = useTranslation();
  const tab = useStore(getActiveTab);
  const readOnly = useStore((state) => state.mode === AppMode.READ);
  const applyRunbookSource = useStore((state) => state.applyRunbookSource);
  const minimapEnabled = useStore((state) => state.minimapEnabled);
  const minimapPosition = useStore((state) => state.minimapPosition);
  const minimapSide: PanelSide | null = minimapEnabled ? minimapPosition : null;

  const source = useMemo(
    () =>
      tab
        ? buildRunbookSource({ variables: tab.variables, blocks: tab.blocks })
        : "",
    [tab],
  );

  const [applied, setApplied] = useState(source);
  const [draft, setDraft] = useState(source);
  const [invalid, setInvalid] = useState(false);

  if (applied !== source) {
    setApplied(source);
    setDraft(source);
    setInvalid(false);
  }

  if (!tab) {
    return null;
  }

  const handleChange = (next: string) => {
    setDraft(next);

    const result = applyRunbookSource(next);
    setInvalid(result === null);

    if (result !== null) {
      setApplied(result);
    }
  };

  return (
    <div id="runbook-source">
      <CodeEditor
        modelId={`${CodeModelScope.RUNBOOK_SOURCE}/${tab.id}`}
        language={CodeLanguage.JSON}
        className="runbook-source-editor"
        value={draft}
        bounded
        folding
        readOnly={readOnly}
        minimapSide={minimapSide}
        hasError={invalid}
        onChange={handleChange}
      />

      {invalid && <p className="runbook-source-error">{t.source.invalid}</p>}
    </div>
  );
}
