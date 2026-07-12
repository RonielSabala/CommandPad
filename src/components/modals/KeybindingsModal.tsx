import {
  KEYBINDINGS,
  formatBinding,
  type KeyBinding,
} from "@/common/keybindings";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import "./KeybindingsModal.css";
import { Modal } from "./Modal";

export function KeybindingsModal() {
  const t = useTranslation();
  const isOpen = useStore((state) => state.keybindingsModalOpen);
  const onClose = useStore((state) => state.closeKeybindingsModal);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <p className="modal-title">{t.keybindingsModal.title}</p>
      <div className="modal-scrollable-body">
        <table className="keybindings-table">
          <tbody>
            {Object.entries(KEYBINDINGS).map(([id, { binding }]) => (
              <tr key={id}>
                <td className="key-cell">
                  <span className="keybinding">{formatBinding(binding)}</span>
                </td>
                <td className="desc-cell">{t.keybindings[id as KeyBinding]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal-actions">
        <button className="btn btn-lg" onClick={onClose}>
          {t.common.close}
        </button>
      </div>
    </Modal>
  );
}
