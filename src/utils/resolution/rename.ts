import { ReferenceSurface } from "@/common/enums";

import { braceToken, replaceReferences, splitReferenceBody } from "./token";

/** Rewrites the key that opens a body. */
function renameKeyChunk(text: string, oldKey: string, newKey: string): string {
  if (text.trim() !== oldKey) {
    return text;
  }

  const at = text.indexOf(oldKey);
  return `${text.slice(0, at)}${newKey}${text.slice(at + oldKey.length)}`;
}

function renameReference(
  raw: string,
  oldKey: string,
  newKey: string,
  surface: ReferenceSurface,
): string {
  const [keyChunk, ...rest] = splitReferenceBody(raw).map((chunk) => ({
    separator: chunk.separator,
    text: renameTokens(chunk.text, oldKey, newKey, surface),
  }));

  return braceToken(
    renameKeyChunk(keyChunk.text, oldKey, newKey) +
      rest.map((chunk) => `${chunk.separator}${chunk.text}`).join(""),
  );
}

function renameTokens(
  text: string,
  oldKey: string,
  newKey: string,
  surface: ReferenceSurface,
): string {
  if (!oldKey) {
    return text;
  }

  return replaceReferences(text, surface, (match) =>
    renameReference(match.raw, oldKey, newKey, surface),
  );
}

function renameAllTokens(
  text: string,
  renames: ReadonlyMap<string, string>,
  surface: ReferenceSurface,
): string {
  let renamed = text;
  for (const [oldKey, newKey] of renames) {
    renamed = renameTokens(renamed, oldKey, newKey, surface);
  }

  return renamed;
}

/** Rewrites a key in command text. */
export function renameCommandTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  return renameTokens(text, oldKey, newKey, ReferenceSurface.COMMAND);
}

/** Rewrites a key in a variable value. */
export function renameValueTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  return renameTokens(text, oldKey, newKey, ReferenceSurface.VALUE);
}

export function renameAllCommandTokens(
  text: string,
  renames: ReadonlyMap<string, string>,
): string {
  return renameAllTokens(text, renames, ReferenceSurface.COMMAND);
}

export function renameAllValueTokens(
  text: string,
  renames: ReadonlyMap<string, string>,
): string {
  return renameAllTokens(text, renames, ReferenceSurface.VALUE);
}
