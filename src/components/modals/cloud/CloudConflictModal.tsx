import { CssClass } from "@/common/constants/css";
import {
  CodeModelScope,
  ConflictSide,
  MonacoLayout,
} from "@/common/editorConfig";
import { CodeLanguage } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import { NoteText } from "@/components/blocks/note/NoteText";
import { VerticalDivider } from "@/components/common/VerticalDivider";
import { useTranslation } from "@/i18n";
import { modelPath } from "@/monaco/modelPath";
import { conflictDiffOptions } from "@/monaco/options";
import { ensureMonacoTheme, monacoThemeName } from "@/monaco/theme";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { DiffEditor, type MonacoDiffEditor } from "@monaco-editor/react";
import {
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { Modal, ModalActions, ModalMessage, ModalTitle } from "../Modal";
import "./CloudConflictModal.css";
import { PROVIDER_NAME } from "./cloudProviders";

export function CloudConflictModal() {
  const t = useTranslation();
  const conflict = useStore((state) => state.cloudConflict);
  const resolve = useStore((state) => state.resolveCloudConflict);
  const theme = useStore((state) => state.theme);
  const diffRef = useRef<MonacoDiffEditor | null>(null);
  const options = useMemo(conflictDiffOptions, []);

  const provider = conflict ? PROVIDER_NAME[conflict.provider] : "";
  const sidePath = (side: ConflictSide) =>
    modelPath(
      `${CodeModelScope.CLOUD_CONFLICT}/${conflict?.runbookId}/${side}`,
    );

  const keepMine = () =>
    resolve(
      diffRef.current?.getModifiedEditor().getValue() ??
        conflict?.localText ??
        null,
    );

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (matchesKeybinding(event.nativeEvent, KeyBinding.SAVE_RUNBOOK)) {
      event.preventDefault();
      event.stopPropagation();
      keepMine();
    }
  };

  return (
    <Modal
      open={conflict !== null}
      onClose={() => resolve(null)}
      className="modal-cloud-conflict"
      animated={false}
    >
      <div className="cloud-conflict-content" onKeyDown={handleKeyDown}>
        <ModalTitle>
          {conflict && (
            <NoteText text={t.cloudConflict.title(conflict.filename)} />
          )}
        </ModalTitle>
        <ModalMessage>{t.cloudConflict.message(provider)}</ModalMessage>

        <div
          className={classNames(
            "code-editor-bounded",
            "cloud-conflict-frame",
            conflict?.error && "has-error",
          )}
        >
          <div className="cloud-conflict-sides">
            <span>{t.cloudConflict.cloudSide(provider)}</span>
            <span>{t.cloudConflict.localSide}</span>
          </div>

          <div className="cloud-conflict-diff">
            {conflict && (
              <DiffEditor
                original={conflict.cloudText}
                modified={conflict.localText}
                language={CodeLanguage.JSON}
                originalModelPath={sidePath(ConflictSide.CLOUD)}
                modifiedModelPath={sidePath(ConflictSide.LOCAL)}
                theme={monacoThemeName(theme)}
                options={options}
                height={MonacoLayout.FULL_HEIGHT}
                beforeMount={() => void ensureMonacoTheme(theme)}
                onMount={(instance) => {
                  diffRef.current = instance;
                  instance.getModifiedEditor().focus();
                }}
                loading={null}
                wrapperProps={{ className: "cloud-conflict-monaco" }}
              />
            )}
          </div>
        </div>

        {conflict?.error && (
          <p className="cloud-conflict-error">{conflict.error}</p>
        )}

        <ModalActions>
          <button
            className={classNames(CssClass.BTN, CssClass.BTN_LG)}
            onClick={() => resolve(null)}
          >
            {t.common.cancel}
          </button>

          <VerticalDivider />

          <button
            className={classNames(CssClass.BTN, CssClass.BTN_LG)}
            onClick={() => resolve(conflict?.cloudText ?? null)}
          >
            {t.cloudConflict.useCloud(provider)}
          </button>

          <button
            className={classNames(
              CssClass.BTN,
              CssClass.BTN_LG,
              CssClass.BTN_PRIMARY,
            )}
            onClick={keepMine}
          >
            {t.cloudConflict.keepMine}
          </button>
        </ModalActions>
      </div>
    </Modal>
  );
}
