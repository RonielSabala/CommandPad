import { CssClass } from "@/common/constants/css";
import { AriaRole } from "@/common/constants/dom";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { CloseIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import type { ReactNode } from "react";

import "./Modal.css";
import { useModalDismiss } from "./useModalDismiss";

interface Props {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
  animated?: boolean;
  noBackdrop?: boolean;
}

export function Modal({
  open,
  onClose,
  className,
  children,
  animated = true,
  noBackdrop = false,
}: Props) {
  const t = useTranslation();
  useModalDismiss(open, onClose);

  return (
    <div
      className={classNames(
        CssClass.MODAL_BACKDROP,
        open && CssClass.MODAL_VISIBLE,
        !animated && CssClass.MODAL_NO_ANIMATION,
        noBackdrop && CssClass.MODAL_BACKDROP_TRANSPARENT,
      )}
      role={AriaRole.DIALOG}
      aria-modal="true"
      aria-hidden={!open}
      inert={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={classNames("modal", className)}>
        <button
          className={classNames(
            "modal-close",
            CssClass.BTN,
            CssClass.BTN_SOFT_ICON,
          )}
          onClick={onClose}
          {...tooltip(t.common.close)}
          aria-label={t.common.close}
        >
          <CloseIcon className={CssClass.ICON_SEMIBOLD} />
        </button>
        {children}
      </div>
    </div>
  );
}

interface PartProps {
  className?: string;
  children: ReactNode;
}

export function ModalTitle({ className, children }: PartProps) {
  return <div className={classNames("modal-title", className)}>{children}</div>;
}

export function ModalMessage({ className, children }: PartProps) {
  return <p className={classNames("modal-message", className)}>{children}</p>;
}

export function ModalActions({ className, children }: PartProps) {
  return (
    <div className={classNames("modal-actions", className)}>{children}</div>
  );
}
