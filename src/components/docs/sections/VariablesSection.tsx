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
            variables: [demoVariable("server", "192.168.1.50")],
            blocks: [
              demoCommand("ping {server}"),
              demoCommand("ssh admin@{server}"),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variables.constants} />
      <Prose text={t.docs.variables.constantsDemoHint} />
      <DemoWorkspace
        className="docs-demo-hide-secret"
        tabs={[
          {
            variables: [
              demoVariable("endpoint", "health"),
              demoVariable("API_URL", "https://api.example.com"),
            ],
            blocks: [demoCommand("curl {API_URL}/{endpoint}")],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variables.unresolved} />
      <Prose text={t.docs.variables.tooltip} />
      <Prose text={t.docs.variables.split} />
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
              demoVariable("project", "commandpad"),
              demoVariable("FOLDER", "~/Projects/{;name}"),
            ],
            blocks: [
              demoCommand("cd {FOLDER;name={project}}"),
              demoCommand("git clone https://github.com/user/{project}"),
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

export function VariableSlicingDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableSlicing.intro} />
      <Prose text={t.docs.variableSlicing.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable(
                "COMMIT",
                "9f2c1ab4d5e6f7890abcdef1234567890abcdef1",
              ),
            ],
            blocks: [
              demoCommand("git checkout {COMMIT}"),
              demoCommand("git tag release-{COMMIT|[:7]}"),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableSlicing.howItWorks} />
      <Prose text={t.docs.variableSlicing.positionsHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("DATE", "2026-07-31")],
            blocks: [
              demoCommand("echo {DATE|[:4]}"),
              demoCommand("echo {DATE|[5:7]}"),
              demoCommand("echo {DATE|[-2:]}"),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableSlicing.step} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("VERSION", "1.2.3")],
            blocks: [
              demoCommand("echo {VERSION|[::2]}"),
              demoCommand("echo {VERSION|[::-1]}"),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableSlicing.invalid} />
      <Prose text={t.docs.variableSlicing.python} />
    </>
  );
}

export function MultilineReferencesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.multilineReferences.intro} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("ENDPOINT", "https://{;region}.api.example.com"),
            ],
            blocks: [
              demoCommand(
                "ping {\n\tENDPOINT\n\t; region = eu-west\n\t| [8:]\n}",
              ),
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
            variables: [demoVariable("user", "admin")],
            blocks: [demoCommand('echo "\\{user\\} = {user}"')],
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
            variables: [demoVariable("password", "s3cr3t-value", true)],
            blocks: [
              demoCommand("zip -r -P {password} backup.zip ~/Documents"),
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
