import { AriaRole } from "@/common/constants/dom";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import "./PageSpinner.css";
import { Spinner } from "./Spinner";

interface Props {
  className?: string;
}

export function PageSpinner({ className }: Props) {
  const t = useTranslation();

  return (
    <div
      className={classNames("page-spinner", className)}
      role={AriaRole.STATUS}
      aria-label={t.common.loading}
    >
      <Spinner />
    </div>
  );
}
