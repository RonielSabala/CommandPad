import { useTranslation } from "@/i18n";
import { DemoVariables } from "../demos/DemoVariables";
import { Prose } from "../Prose";

export function VariablesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variables.intro} />
      <Prose text={t.docs.variables.usage} />
      <Prose text={t.docs.variables.unresolved} />
      <Prose text={t.docs.variables.duplicatesAndEmpty} />
      <DemoVariables
        variables={[{ key: "NAMESPACE", value: "production" }]}
        command="kubectl get pods -n {NAMESPACE}"
        secretToggleHidden
      />
    </>
  );
}

export function VariableReferencesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableReferences.intro} />
      <Prose text={t.docs.variableReferences.circular} />
      <DemoVariables
        variables={[
          { key: "HOST", value: "api.example.com" },
          { key: "BASE_URL", value: "https://{HOST}/api" },
        ]}
        command="curl {BASE_URL}/health"
      />
    </>
  );
}

export function ParameterizedPlaceholdersDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.parameterizedPlaceholders.intro} />
      <Prose text={t.docs.parameterizedPlaceholders.fill} />
      <Prose text={t.docs.parameterizedPlaceholders.unresolved} />
      <DemoVariables
        variables={[{ key: "PROJECT", value: "projects/{;name}/src" }]}
        command="cd {PROJECT;name=commandpad}"
      />
    </>
  );
}

export function EscapingBracesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.escapingBraces.intro} />
      <Prose text={t.docs.escapingBraces.scope} />
      <DemoVariables
        variables={[{ key: "USER", value: "admin" }]}
        command={'echo "\\{USER\\} = {USER}"'}
      />
    </>
  );
}

export function SecretVariablesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.secretVariables.intro} />
      <DemoVariables
        variables={[{ key: "TOKEN", value: "s3cr3t-value", secret: true }]}
        command="curl -u admin:{TOKEN} https://api.example.com"
      />
    </>
  );
}
