import { BlocksList } from "@/components/blocks/BlocksList";
import { useTranslation } from "@/i18n";
import { demoCommand, demoVariable } from "../demos/demoSeeds";
import { DemoVariableRows, DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";

export function VariablesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variables.intro} />
      <Prose text={t.docs.variables.usage} />
      <Prose text={t.docs.variables.unresolved} />
      <Prose text={t.docs.variables.duplicatesAndEmpty} />
      <DemoWorkspace
        className="docs-demo-hide-secret"
        tabs={[
          {
            variables: [demoVariable("NAMESPACE", "production")],
            blocks: [demoCommand("kubectl get pods -n {NAMESPACE}")],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
    </>
  );
}

export function VariableReferencesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableReferences.intro} />
      <Prose text={t.docs.variableReferences.circular} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("HOST", "api.example.com"),
              demoVariable("BASE_URL", "https://{HOST}/api"),
            ],
            blocks: [demoCommand("curl {BASE_URL}/health")],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
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
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("PROJECT", "projects/{;name}/src")],
            blocks: [demoCommand("cd {PROJECT;name=commandpad}")],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.parameterizedPlaceholders.multiple} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("GREETING", t.docs.demo.greetingTemplate)],
            blocks: [
              demoCommand('echo "{GREETING;name=Sam;place=CommandPad}"'),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
    </>
  );
}

export function EscapingBracesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.escapingBraces.intro} />
      <Prose text={t.docs.escapingBraces.scope} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("USER", "admin")],
            blocks: [demoCommand('echo "\\{USER\\} = {USER}"')],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
    </>
  );
}

export function SecretVariablesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.secretVariables.intro} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("TOKEN", "s3cr3t-value", true)],
            blocks: [
              demoCommand("curl -u admin:{TOKEN} https://api.example.com"),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
    </>
  );
}
