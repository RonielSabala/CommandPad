import { KEYBINDINGS, formatBinding } from '@/common/keybindings';
import { useStore } from '@/store/store';
import { Modal } from './Modal';

export function KeybindingsModal() {
  const open = useStore((s) => s.keybindingsModalOpen);
  const close = useStore((s) => s.closeKeybindingsModal);

  return (
    <Modal open={open} onClose={close}>
      <p className="modal-title">App Keybindings</p>
      <div className="modal-scrollable-body">
        <table className="keybindings-table">
          <tbody>
            {Object.entries(KEYBINDINGS).map(([id, { binding, description }]) => (
              <tr key={id}>
                <td className="key-cell">
                  <span className="kbd">{formatBinding(binding)}</span>
                </td>
                <td className="desc-cell">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal-actions">
        <button className="btn btn-lg" onClick={close}>
          Close
        </button>
      </div>
    </Modal>
  );
}
