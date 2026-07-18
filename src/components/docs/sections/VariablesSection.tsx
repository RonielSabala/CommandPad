import { BlocksList } from "@/components/blocks/BlocksList";
import { useTranslation } from "@/i18n";
import { demoCommand, demoVariable } from "../demos/demoSeeds";
import { DemoVariableRows, DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";
import "./VariablesSection.css";

export function VariablesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variables.why} />
      <Prose text={t.docs.variables.intro} />
      <Prose text={t.docs.variables.usage} />
      <Prose text={t.docs.variables.demoHint} />
      <DemoWorkspace
        className="docs-demo-hide-secret"
        tabs={[
          {
            variables: [demoVariable("SERVER", "192.168.1.50")],
            blocks: [
              demoCommand("ping {SERVER}"),
              demoCommand("ssh admin@{SERVER}"),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variables.unresolved} />
      <Prose text={t.docs.variables.duplicatesAndEmpty} />
      <Prose text={t.docs.variables.tooltip} />
    </>
  );
}

export function VariableReferencesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableReferences.intro} />
      <Prose text={t.docs.variableReferences.demoHint} />
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
      <Prose text={t.docs.variableReferences.circular} />
    </>
  );
}

export function ParameterizedPlaceholdersDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.parameterizedPlaceholders.intro} />
      <Prose text={t.docs.parameterizedPlaceholders.fill} />
      <Prose text={t.docs.parameterizedPlaceholders.seeExample} />
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
      <Prose text={t.docs.parameterizedPlaceholders.nested} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("PROJECT", "commandpad"),
              demoVariable("FOLDER", "~/Projects/{;name}"),
            ],
            blocks: [
              demoCommand("cd {FOLDER;name={PROJECT}}"),
              demoCommand("git clone https://github.com/user/{PROJECT}"),
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
      <Prose text={t.docs.escapingBraces.tryHint} />
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
      <Prose text={t.docs.escapingBraces.scope} />
    </>
  );
}

export function SecretVariablesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.secretVariables.intro} />
      <Prose text={t.docs.secretVariables.copyNote} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("PASSWORD", "s3cr3t-value", true)],
            blocks: [
              demoCommand("zip -r -P {PASSWORD} backup.zip ~/Documents"),
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
