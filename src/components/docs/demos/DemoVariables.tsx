import { EyeIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import {
  getSecretKeys,
  getVariableMap,
  renameVariableTokens,
} from "@/utils/resolution";
import { classNames } from "@/utils/string";
import { useMemo, useState } from "react";
import "@/components/sidebar/variables/VariableRow.css";
import { DemoCommandBlock } from "./DemoCommandBlock";
import { DocsDemo } from "./DocsDemo";

interface DemoVariableSeed {
  key: string;
  value: string;
  secret?: boolean;
}

interface Props {
  variables?: DemoVariableSeed[];
  command: string;
  /** Hide the eye button in sections that precede the secrets docs, so it doesn't raise questions before its own section explains it */
  secretToggleHidden?: boolean;
}

// Live playground: editable variable rows feeding a command block replica,
// resolved with the app's real resolution utilities
export function DemoVariables({
  variables = [],
  command,
  secretToggleHidden = false,
}: Props) {
  const t = useTranslation();
  const seed = () =>
    variables.map((entry, index) => ({ id: `demo-${index}`, ...entry }));

  const [vars, setVars] = useState(seed);
  const [text, setText] = useState(command);
  const [resetCount, setResetCount] = useState(0);

  const reset = () => {
    setVars(seed());
    setText(command);
    setResetCount((count) => count + 1);
  };

  const variableMap = useMemo(() => getVariableMap(vars), [vars]);
  const secretKeys = useMemo(() => getSecretKeys(vars), [vars]);

  const updateVar = (index: number, patch: Partial<DemoVariableSeed>) =>
    setVars((current) =>
      current.map((variable, i) =>
        i === index ? { ...variable, ...patch } : variable,
      ),
    );

  // Renaming a key rewrites its references, mirroring the real app
  const renameVarKey = (index: number, nextKey: string) => {
    const oldKey = vars[index].key.trim();
    const newKey = nextKey.trim();
    const shouldRename = !!oldKey && !!newKey && oldKey !== newKey;

    setVars((current) =>
      current.map((variable, i) => {
        if (i === index) {
          return { ...variable, key: nextKey };
        }

        if (!shouldRename) {
          return variable;
        }

        const value = renameVariableTokens(variable.value, oldKey, newKey);
        return value === variable.value ? variable : { ...variable, value };
      }),
    );

    if (shouldRename) {
      setText((current) => renameVariableTokens(current, oldKey, newKey));
    }
  };

  return (
    <DocsDemo onReset={reset}>
      {vars.length > 0 && (
        <div className="docs-demo-variables">
          {vars.map((variable, index) => (
            <div key={variable.id} className="docs-demo-variable-row">
              <div
                className={classNames(
                  "variable-inputs",
                  variable.secret && "is-secret",
                )}
              >
                <input
                  className="variable-key-input"
                  type="text"
                  placeholder={t.variables.keyPlaceholder}
                  value={variable.key}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(event) =>
                    renameVarKey(index, event.target.value)
                  }
                />
                <input
                  className="variable-value-input"
                  type="text"
                  placeholder={t.variables.valuePlaceholder}
                  value={variable.value}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(event) =>
                    updateVar(index, { value: event.target.value })
                  }
                />
              </div>
              <button
                className={classNames(
                  "btn btn-icon variable-secret-btn",
                  variable.secret && "is-active",
                  secretToggleHidden && "docs-demo-secret-btn-hidden",
                )}
                tabIndex={secretToggleHidden ? -1 : undefined}
                onClick={() => updateVar(index, { secret: !variable.secret })}
                title={variable.secret ? t.variables.reveal : t.variables.mask}
              >
                <EyeIcon slashed={variable.secret} className="icon-md icon-bold" />
              </button>
            </div>
          ))}
        </div>
      )}
      <DemoCommandBlock
        key={resetCount}
        text={text}
        onTextChange={setText}
        variableMap={variableMap}
        secretKeys={secretKeys}
      />
    </DocsDemo>
  );
}
