import { CommandVariableTokenRegex, VariableTokenRegex } from "@/common/config";

import { braceToken, getTokenKey } from "./token";

function renameTokenKey(
  token: string,
  raw: string,
  oldKey: string,
  newKey: string,
  tokenRegex: RegExp,
): string {
  // A reference inside a param value is a token in its own right
  const inner = raw.replace(tokenRegex, (nested, nestedRaw: string) =>
    renameTokenKey(nested, nestedRaw, oldKey, newKey, tokenRegex),
  );

  if (getTokenKey(inner) !== oldKey) {
    return inner === raw ? token : braceToken(inner);
  }

  // The key opens the token, so its first occurrence is the key itself
  const at = inner.indexOf(oldKey);

  return braceToken(
    `${inner.slice(0, at)}${newKey}${inner.slice(at + oldKey.length)}`,
  );
}

function renameTokens(
  text: string,
  oldKey: string,
  newKey: string,
  tokenRegex: RegExp,
): string {
  if (!oldKey) {
    return text;
  }

  return text.replace(tokenRegex, (token, raw: string) =>
    renameTokenKey(token, raw, oldKey, newKey, tokenRegex),
  );
}

function renameAllTokens(
  text: string,
  renames: ReadonlyMap<string, string>,
  tokenRegex: RegExp,
): string {
  let renamed = text;
  for (const [oldKey, newKey] of renames) {
    renamed = renameTokens(renamed, oldKey, newKey, tokenRegex);
  }

  return renamed;
}

/** Rewrites a key in command text. */
export function renameCommandTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  return renameTokens(text, oldKey, newKey, CommandVariableTokenRegex);
}

/** Rewrites a key in a variable value. */
export function renameValueTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  return renameTokens(text, oldKey, newKey, VariableTokenRegex);
}

export function renameAllCommandTokens(
  text: string,
  renames: ReadonlyMap<string, string>,
): string {
  return renameAllTokens(text, renames, CommandVariableTokenRegex);
}

export function renameAllValueTokens(
  text: string,
  renames: ReadonlyMap<string, string>,
): string {
  return renameAllTokens(text, renames, VariableTokenRegex);
}
