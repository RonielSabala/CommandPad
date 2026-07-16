import { KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import { useTranslation } from "@/i18n";
import { Kbd, Prose } from "../Prose";

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
                <Kbd binding={id} />
              </td>
              <td>{t.keybindings[id]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
