import { FileDateFormat, FileSizeConfig } from "@/common/config";
import type { Language } from "@/i18n";

export function formatFileSize(bytes: number, language: Language): string {
  let value = bytes;
  let unitIndex = 0;

  while (
    value >= FileSizeConfig.BASE &&
    unitIndex < FileSizeConfig.UNITS.length - 1
  ) {
    value /= FileSizeConfig.BASE;
    unitIndex += 1;
  }

  // Whole bytes never need decimals
  const decimals = unitIndex === 0 ? 0 : FileSizeConfig.DECIMALS;
  const formatted = new Intl.NumberFormat(language, {
    maximumFractionDigits: decimals,
  }).format(value);

  return `${formatted} ${FileSizeConfig.UNITS[unitIndex]}`;
}

export function formatTimestamp(
  isoDate: string,
  language: Language,
): string | null {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(language, FileDateFormat).format(date);
}
