import {
  CloudSyncConfig,
  FileDateFormat,
  FileSizeConfig,
  FileTimeFormat,
} from "@/common/config";
import type { Language } from "@/i18n";
import type { CloudFolderRef } from "@/services/cloud";

import { joinPath } from "./path";

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

/** `path` from the app folder, then any `names` inside it. */
export function formatCloudPath(
  path: CloudFolderRef[],
  ...names: string[]
): string {
  return joinPath([
    CloudSyncConfig.APP_FOLDER_NAME,
    ...path.map((folder) => folder.name),
    ...names,
  ]);
}

export function formatTimestamp(
  isoDate: string,
  language: Language,
): string | null {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const time = new Intl.DateTimeFormat(language, FileTimeFormat).format(date);
  const day = new Intl.DateTimeFormat(language, FileDateFormat).format(date);
  return `${time}, ${day}`;
}
