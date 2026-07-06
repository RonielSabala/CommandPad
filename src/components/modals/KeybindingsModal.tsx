import { KEYBINDINGS, formatBinding } from "@/common/keybindings";
import { useStore } from "@/store/store";
import "./KeybindingsModal.css";
import { Modal } from "./Modal";

export function KeybindingsModal() {
  const isOpen = useStore((state) => state.keybindingsModalOpen);
  const onClose = useStore((state) => state.closeKeybindingsModal);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <p className="modal-title">App Keybindings</p>
      <div className="modal-scrollable-body">
        <table className="keybindings-table">
          <tbody>
            {Object.entries(KEYBINDINGS).map(
              ([id, { binding, description }]) => (
                <tr key={id}>
                  <td className="key-cell">
                    <span className="keybinding">{formatBinding(binding)}</span>
                  </td>
                  <td className="desc-cell">{description}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <div className="modal-actions">
        <button className="btn btn-lg" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
