import { useTranslation } from "@/i18n";
import { Prose } from "../Prose";

export function VariablesDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.variables.intro} />
      <Prose text={t.docs.variables.usage} />
    </>
  );
}

export function VariableReferencesDocs() {
  const t = useTranslation();
  return <Prose text={t.docs.variableReferences.intro} />;
}

export function ParameterizedPlaceholdersDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.parameterizedPlaceholders.intro} />
      <Prose text={t.docs.parameterizedPlaceholders.fill} />
      <Prose text={t.docs.parameterizedPlaceholders.unresolved} />
    </>
  );
}

export function EscapingBracesDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.escapingBraces.intro} />
      <Prose text={t.docs.escapingBraces.scope} />
    </>
  );
}

export function SecretVariablesDocs() {
  const t = useTranslation();
  return <Prose text={t.docs.secretVariables.intro} />;
}
