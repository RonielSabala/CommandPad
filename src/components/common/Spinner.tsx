import { classNames } from "@/utils/string";
import "./Spinner.css";

interface Props {
  className?: string;
}

export function Spinner({ className }: Props) {
  return <span className={classNames("spinner", className)} />;
}
