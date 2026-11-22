import { ReferenceSurface } from "@/common/enums";

import { braceToken, replaceReferences, splitReferenceBody } from "./token";

/** Old keys mapped to their new keys. */
type Renames = ReadonlyMap<string, string>;

/** Rewrites the key that opens a body. */
function renameKeyChunk(text: string, renames: Renames): string {
  const key = text.trim();
  const newKey = key ? renames.get(key) : undefined;
  if (newKey === undefined) {
    return text;
  }

  const at = text.indexOf(key);
  return `${text.slice(0, at)}${newKey}${text.slice(at + key.length)}`;
}

function renameReference(
  raw: string,
  renames: Renames,
  surface: ReferenceSurface,
): string {
  const chunks = splitReferenceBody(raw);
  let body = renameKeyChunk(
    renameTokens(chunks[0].text, renames, surface),
    renames,
  );

  for (let i = 1; i < chunks.length; i += 1) {
    const { separator, text } = chunks[i];
    body += separator + renameTokens(text, renames, surface);
  }

  return braceToken(body);
}

/** Whether `text` holds an old key at all. */
function mentionsRenamedKey(text: string, renames: Renames): boolean {
  for (const oldKey of renames.keys()) {
    if (oldKey && text.includes(oldKey)) {
      return true;
    }
  }

  return false;
}

/** Rewrites every renamed key in one pass. */
function renameTokens(
  text: string,
  renames: Renames,
  surface: ReferenceSurface,
): string {
  return replaceReferences(text, surface, (match) =>
    renameReference(match.raw, renames, surface),
  );
}

function renameText(
  text: string,
  renames: Renames,
  surface: ReferenceSurface,
): string {
  return mentionsRenamedKey(text, renames)
    ? renameTokens(text, renames, surface)
    : text;
}

export function renameAllCommandTokens(text: string, renames: Renames): string {
  return renameText(text, renames, ReferenceSurface.COMMAND);
}

export function renameAllValueTokens(text: string, renames: Renames): string {
  return renameText(text, renames, ReferenceSurface.VALUE);
}

/** Rewrites a key in command text. */
export function renameCommandTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  return renameAllCommandTokens(text, new Map([[oldKey, newKey]]));
}

/** Rewrites a key in a variable value. */
export function renameValueTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  return renameAllValueTokens(text, new Map([[oldKey, newKey]]));
}
