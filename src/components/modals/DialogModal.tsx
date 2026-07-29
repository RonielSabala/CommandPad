import { DialogTone } from "@/common/enums";
import { NoteText } from "@/components/blocks/note/NoteText";
import { classNames } from "@/utils/string";
import type { ReactNode } from "react";
import {
  ExclamationOctagonFill,
  ExclamationTriangleFill,
  InfoCircleFill,
  type Icon,
} from "react-bootstrap-icons";
import "./DialogModal.css";
import { Modal } from "./Modal";

const TONE_ICON: Record<DialogTone, Icon> = {
  [DialogTone.DANGER]: ExclamationOctagonFill,
  [DialogTone.WARNING]: ExclamationTriangleFill,
  [DialogTone.INFO]: InfoCircleFill,
};

const TONE_CLASS: Record<DialogTone, string> = {
  [DialogTone.DANGER]: "dialog-danger",
  [DialogTone.WARNING]: "dialog-warning",
  [DialogTone.INFO]: "dialog-info",
};

interface Props {
  open: boolean;
  onClose: () => void;
  tone: DialogTone;
  title: string;
  message: string;
  children: ReactNode;
}

export function DialogModal({
  open,
  onClose,
  tone,
  title,
  message,
  children,
}: Props) {
  const ToneIcon = TONE_ICON[tone];

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={classNames("modal-dialog", TONE_CLASS[tone])}
      animated={false}
    >
      <header className="dialog-header">
        <ToneIcon className="dialog-icon" aria-hidden="true" />
        <p className="dialog-title">{title}</p>
      </header>
      <p className="dialog-message">
        <NoteText text={message} />
      </p>
      <div className="modal-actions">{children}</div>
    </Modal>
  );
}
