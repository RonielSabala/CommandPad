import { formatBinding, KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import { useTranslation } from "@/i18n";
import { Prose } from "../Prose";

const BINDING_IDS = Object.keys(KEYBINDINGS) as KeyBinding[];

export function KeyboardShortcutsDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.keyboardShortcuts.intro} />
      <table className="docs-table">
        <tbody>
          {BINDING_IDS.map((id) => (
            <tr key={id}>
              <td>
                <kbd className="docs-kbd">
                  {formatBinding(KEYBINDINGS[id].binding)}
                </kbd>
              </td>
              <td>{t.keybindings[id]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
