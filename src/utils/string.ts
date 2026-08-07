import { DuplicateNameConfig } from "@/common/config";

export function splitLines(text: string): string[] {
  return text.split("\n");
}

export function countLines(text: string): number {
  return splitLines(text).length;
}

export function joinLines(lines: string[]): string {
  return lines.join("\n");
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

export function countCharacters(text: string): number {
  return Array.from(text).length;
}

export function sliceString(
  text: string,
  start: number | null,
  stop: number | null,
  step: number,
): string {
  const chars = Array.from(text);
  const length = chars.length;
  const forward = step > 0;

  // A negative step walks down to index -1
  const lower = forward ? 0 : -1;
  const upper = forward ? length : length - 1;

  function clamp(bound: number): number {
    return bound < 0 ? Math.max(bound + length, lower) : Math.min(bound, upper);
  }

  const from = start === null ? (forward ? lower : upper) : clamp(start);
  const to = stop === null ? (forward ? upper : lower) : clamp(stop);

  const sliced: string[] = [];
  for (let i = from; forward ? i < to : i > to; i += step) {
    sliced.push(chars[i]);
  }

  return sliced.join("");
}

export function stripStart(text: string, cut: string): string {
  let result = text;
  while (cut && result.startsWith(cut)) {
    result = result.slice(cut.length);
  }

  return result;
}

export function stripEnd(text: string, cut: string): string {
  let result = text;
  while (cut && result.endsWith(cut)) {
    result = result.slice(0, -cut.length);
  }

  return result;
}

export function stripBoth(text: string, cut: string): string {
  return stripEnd(stripStart(text, cut), cut);
}

export function classNames(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
