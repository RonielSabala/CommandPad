import { PATH_SEPARATOR } from "@/common/config";

export function splitPath(path: string): string[] {
  return path
    .split(PATH_SEPARATOR)
    .map((name) => name.trim())
    .filter(Boolean);
}

export function joinPath(names: readonly string[]): string {
  return names.join(PATH_SEPARATOR);
}

/** The names as a folder's path. */
export function folderPath(names: readonly string[]): string {
  return names.map((name) => name + PATH_SEPARATOR).join("");
}

/** `path` up to and including its last separator. */
export function parentPath(path: string): string {
  return path.slice(0, path.lastIndexOf(PATH_SEPARATOR) + 1);
}
