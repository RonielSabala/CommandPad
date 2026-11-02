import { InfoConfig } from "@/common/config";
import { useStore } from "@/store/store";
import { formatFileSize } from "@/utils/format";
import { useMemo } from "react";

/** Counts and sizes in the UI language. */
export function useInfoFormat() {
  const language = useStore((state) => state.language);

  return useMemo(() => {
    const numbers = new Intl.NumberFormat(language);
    const decimals = new Intl.NumberFormat(language, {
      maximumFractionDigits: InfoConfig.RATIO_DECIMALS,
    });

    const size = (bytes: number) => formatFileSize(bytes, language);

    return {
      count: (value: number) => numbers.format(value),
      decimal: (value: number) => decimals.format(value),
      size,
      sizeDelta: (bytes: number) =>
        bytes === 0
          ? size(0)
          : (bytes > 0 ? InfoConfig.PLUS : InfoConfig.MINUS) +
            size(Math.abs(bytes)),
    };
  }, [language]);
}
