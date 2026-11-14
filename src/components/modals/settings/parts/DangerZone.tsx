import { FramedSection } from "@/components/common/FramedSection";
import type { ReactNode } from "react";

import "./DangerZone.css";

interface Props {
  title: string;
  children: ReactNode;
}

export function DangerZone({ title, children }: Props) {
  return (
    <FramedSection className="danger-zone" title={title}>
      {children}
    </FramedSection>
  );
}
