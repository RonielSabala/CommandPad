import { InfoConfig } from "@/common/config";
import { useLanguage } from "@/i18n";
import { formatFileSize } from "@/utils/format";
import { useMemo } from "react";

/** `format` over a value that may be unknown. */
function orUnknown(format: (value: number) => string) {
  return (value: number | null) => (value === null ? null : format(value));
}

/** `format` over a value that may be unknown, showing zero as empty. */
function orEmpty(format: (value: number) => string) {
  return (value: number | null) => (value ? format(value) : null);
}

export type InfoFormat = ReturnType<typeof useInfoFormat>;

/** Counts and sizes in the UI language. */
export function useInfoFormat() {
  const language = useLanguage();

  return useMemo(() => {
    const numbers = new Intl.NumberFormat(language);
    const decimals = new Intl.NumberFormat(language, {
      maximumFractionDigits: InfoConfig.RATIO_DECIMALS,
    });
    const minutes = new Intl.NumberFormat(language, {
      maximumFractionDigits: InfoConfig.READING_TIME_DECIMALS,
    });

    const size = (bytes: number) => formatFileSize(bytes, language);

    return {
      count: orEmpty((value) => numbers.format(value)),
      /** A count whose zero is the answer. */
      exactCount: orUnknown((value) => numbers.format(value)),
      decimal: (value: number) => decimals.format(value),
      minutes: (value: number) => minutes.format(value),
      size: orEmpty(size),
      sizeDelta: (bytes: number) =>
        bytes === 0
          ? size(0)
          : (bytes > 0 ? InfoConfig.PLUS : InfoConfig.MINUS) +
            size(Math.abs(bytes)),
    };
  }, [language]);
}
