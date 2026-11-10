import { CssClass } from "@/common/constants/css";
import { formatBinding, KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import { Kbd } from "@/components/common/Kbd";
import { useTranslation } from "@/i18n";

import { Prose } from "../Prose";

const BINDING_IDS = Object.keys(KEYBINDINGS) as KeyBinding[];

export function KeyboardShortcutsDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose
        text={t.docs.keyboardShortcuts.intro(
          formatBinding(KEYBINDINGS[KeyBinding.COMMAND_PALETTE].binding),
        )}
      />
      <div className="docs-prose">
        <table className={CssClass.NOTE_TABLE}>
          <tbody>
            {BINDING_IDS.map((id) => (
              <tr key={id}>
                <td>
                  <Kbd binding={id} />
                </td>
                <td>{t.keybindings[id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
