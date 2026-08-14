import {
  VariableParamPlaceholderRegex,
  VariableSyntax,
} from "@/common/variableSyntax";

interface ReferenceParam {
  name: string;
  value: string;
}

interface ResolvedTemplate {
  text: string;
  fullyResolved: boolean;
}

export function parseParam(chunk: string): ReferenceParam | null {
  const at = chunk.indexOf(VariableSyntax.PARAM_ASSIGNMENT);
  if (at === -1) {
    return null;
  }

  const name = chunk.slice(0, at).trim();
  const value = chunk.slice(at + 1).trim();

  return name && value ? { name, value } : null;
}

export function getTemplateParamNames(template: string): string[] {
  const names = new Set<string>();

  for (const [, rawName] of template.matchAll(VariableParamPlaceholderRegex)) {
    names.add(rawName.trim());
  }

  return [...names];
}

export function applyTemplateParams(
  template: string,
  params: Record<string, string>,
): ResolvedTemplate {
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
