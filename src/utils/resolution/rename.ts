import { VariableTokenRegex } from "@/common/config";

import { braceToken, getTokenKey } from "./token";

function renameTokenKey(
  token: string,
  raw: string,
  oldKey: string,
  newKey: string,
): string {
  // A reference inside a param value is a token in its own right
  const inner = raw.replace(VariableTokenRegex, (nested, nestedRaw: string) =>
    renameTokenKey(nested, nestedRaw, oldKey, newKey),
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

export function renameVariableTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  if (!oldKey) {
    return text;
  }

  return text.replace(VariableTokenRegex, (token, raw: string) =>
    renameTokenKey(token, raw, oldKey, newKey),
  );
}

export function renameAllVariableTokens(
  text: string,
  renames: ReadonlyMap<string, string>,
): string {
  let renamed = text;
  for (const [oldKey, newKey] of renames) {
    renamed = renameVariableTokens(renamed, oldKey, newKey);
  }

  return renamed;
}
