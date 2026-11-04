import { classNames } from "@/utils/string";
import type { ReactNode } from "react";

import "./FramedSection.css";

interface Props {
  title?: ReactNode;
  striped?: boolean;
  children: ReactNode;
}

/** A titled, bordered box of rows. */
export function FramedSection({ title, striped = false, children }: Props) {
  return (
    <section className={classNames("framed-section", striped && "is-striped")}>
      {title && <p className="framed-section-title">{title}</p>}

      <div className="framed-section-frame">{children}</div>
    </section>
  );
}
