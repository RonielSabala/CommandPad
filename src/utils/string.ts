import { DuplicateNameConfig } from "@/common/config";

export function countLines(text: string): number {
  return text.split("\n").length;
}

export function joinLines(lines: string[]): string {
  return lines.join("\n");
}

export function toTitleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function matchesQuery(
  query: string,
  ...fields: (string | undefined)[]
): boolean {
  if (!query) {
    return true;
  }

  const needle = query.toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

export function buildDuplicateName(
  base: string,
  isTaken: (candidate: string) => boolean,
): string {
  const stem = base.replace(DuplicateNameConfig.SUFFIX_REGEX, "");

  let name = "";
  let index = DuplicateNameConfig.FIRST_INDEX;

  do {
    name = `${stem}${DuplicateNameConfig.SUFFIX(index)}`;
    index++;
  } while (isTaken(name));

  return name;
}

export function classNames(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
