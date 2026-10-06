import { CssClass } from "@/common/constants/css";
import { classNames } from "@/utils/string";
import type { ReactNode } from "react";

import "./EmptyState.css";

interface Props {
  icon: ReactNode;
  title: string;
  hint: string;
}

export function EmptyState({ icon, title, hint }: Props) {
  return (
    <div className={classNames("empty-state", CssClass.NO_USER_SELECT)}>
      {icon}
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-hint">{hint}</p>
    </div>
  );
}
