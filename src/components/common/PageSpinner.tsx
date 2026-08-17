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
      role="status"
      aria-label={t.common.loading}
    >
      <Spinner />
    </div>
  );
}
