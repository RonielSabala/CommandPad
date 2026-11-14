import { CssClass } from "@/common/constants/css";
import { KEYBINDING_IDS, KeyBinding } from "@/common/keybindings";
import { Kbd } from "@/components/common/Kbd";
import { useBindingLabel } from "@/hooks/useBindingLabel";
import { useTranslation } from "@/i18n";

import { Prose } from "../Prose";
import { useShortcutLabel } from "../useShortcutLabel";

function ShortcutRow({ id }: { id: KeyBinding }) {
  const t = useTranslation();
  if (!useBindingLabel(id)) {
    return null;
  }

  return (
    <tr>
      <td>
        <Kbd binding={id} />
      </td>
      <td>{t.keybindings[id]}</td>
    </tr>
  );
}

export function KeyboardShortcutsDocs() {
  const t = useTranslation();
  const paletteKey = useShortcutLabel(KeyBinding.COMMAND_PALETTE);

  return (
    <>
      <Prose text={t.docs.keyboardShortcuts.intro(paletteKey)} />
      <div className="docs-prose">
        <table className={CssClass.NOTE_TABLE}>
          <tbody>
            {KEYBINDING_IDS.map((id) => (
              <ShortcutRow key={id} id={id} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
