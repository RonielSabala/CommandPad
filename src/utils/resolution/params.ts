import {
  CommandVariableTokenRegex,
  VariableParamPlaceholderRegex,
  VariableSyntax,
} from "@/common/config";

import type { VariableMap } from "./types";

interface ParsedVariableToken {
  key: string;
  params: Record<string, string>;
}

export function parseVariableToken(raw: string): ParsedVariableToken {
  const [rawKey, ...rawParams] = raw.split(VariableSyntax.PARAM_SEPARATOR);
  const params: Record<string, string> = {};

  for (const part of rawParams) {
    const eqIndex = part.indexOf(VariableSyntax.PARAM_ASSIGNMENT);
    if (eqIndex === -1) {
      continue;
    }

    const paramKey = part.slice(0, eqIndex).trim();
    const paramValue = part.slice(eqIndex + 1).trim();

    if (paramKey && paramValue) {
      params[paramKey] = paramValue;
    }
  }

  return { key: rawKey.trim(), params };
}

export function resolveParamRefs(
  params: Record<string, string>,
  variableMap: VariableMap,
): { params: Record<string, string>; fullyResolved: boolean } {
  let fullyResolved = true;
  const resolved: Record<string, string> = {};

  for (const [name, value] of Object.entries(params)) {
    resolved[name] = value.replace(
      CommandVariableTokenRegex,
      (match, rawRef: string) => {
        const refKey = rawRef.trim();
        if (
          Object.prototype.hasOwnProperty.call(variableMap, refKey) &&
          variableMap[refKey]
        ) {
          return variableMap[refKey];
        }

        fullyResolved = false;
        return match;
      },
    );
  }

  return { params: resolved, fullyResolved };
}

export function applyTemplateParams(
  template: string,
  params: Record<string, string>,
): { text: string; fullyResolved: boolean } {
  let fullyResolved = true;

  const text = template.replace(
    VariableParamPlaceholderRegex,
    (match, rawName: string) => {
      const paramName = rawName.trim();
      if (paramName in params) {
        return params[paramName];
      }

      fullyResolved = false;
      return match;
    },
  );

  return { text, fullyResolved };
}
