import { Language } from "@/i18n/types";
import type { SVGProps } from "react";

type FlagProps = SVGProps<SVGSVGElement>;

function UkFlag(props: FlagProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <rect width="16" height="16" fill="#012169" />
      <path d="M0 0 16 16 M16 0 0 16" stroke="#ffffff" strokeWidth="3.2" />
      <path d="M0 0 16 16 M16 0 0 16" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M8 0 V16 M0 8 H16" stroke="#ffffff" strokeWidth="5" />
      <path d="M8 0 V16 M0 8 H16" stroke="#c8102e" strokeWidth="3" />
    </svg>
  );
}

function SpainFlag(props: FlagProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <rect width="16" height="16" fill="#aa151b" />
      <rect y="4" width="16" height="8" fill="#f1bf00" />
    </svg>
  );
}

const FLAGS: Record<Language, (props: FlagProps) => React.ReactElement> = {
  [Language.EN]: UkFlag,
  [Language.ES]: SpainFlag,
};

export function LanguageFlag({
  language,
  ...props
}: FlagProps & { language: Language }) {
  const Flag = FLAGS[language];
  return <Flag {...props} />;
}
