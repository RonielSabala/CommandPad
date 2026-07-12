import { useTranslation } from "@/i18n";
import { DemoVariables } from "../demos/DemoVariables";
import { Prose } from "../Prose";

export function VariablesDocs() {
  const t = useTranslation();
  return (
    <>
      <Prose text={t.docs.variables.intro} />
      <Prose text={t.docs.variables.usage} />
      <Prose text={t.docs.variables.duplicatesAndEmpty} />
      <DemoVariables
        variables={[{ key: "NAMESPACE", value: "production" }]}
        command="kubectl get pods -n {NAMESPACE}"
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
        variables={[{ key: "A", value: "generic_path/{;user_path}" }]}
        command="cd {A;user_path=my_path}"
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
      <DemoVariables command="awk '\{print $1\}'" />
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
        command='curl -H "Authorization: Bearer {TOKEN}" https://api.example.com'
      />
    </>
  );
}
