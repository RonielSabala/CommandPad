import { classNames } from "@/utils/string";
import type { ReactNode } from "react";

import "./FramedSection.css";

interface Props {
  title?: ReactNode;
  striped?: boolean;
  className?: string;
  children: ReactNode;
}

/** A titled, bordered box of rows. */
export function FramedSection({
  title,
  striped = false,
  className,
  children,
}: Props) {
  return (
    <section
      className={classNames(
        className,
        "framed-section",
        striped && "is-striped",
      )}
    >
      {title && <p className="framed-section-title">{title}</p>}

      <div className="framed-section-frame">{children}</div>
    </section>
  );
}
