import { BlocksList } from "@/components/blocks/BlocksList";
import { useTranslation } from "@/i18n";
import { demoCommand, demoVariable } from "../demos/demoSeeds";
import { DemoVariableRows, DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose, ProseTable } from "../Prose";
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
                "commit",
                "9f2c1ab4d5e6f7890abcdef1234567890abcdef1",
              ),
            ],
            blocks: [
              demoCommand("git checkout {commit}"),
              demoCommand("git tag release-{commit|[:7]}"),
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
            variables: [demoVariable("date", "2026-07-31")],
            blocks: [
              demoCommand("echo {date|[:4]}"),
              demoCommand("echo {date|[5:7]}"),
              demoCommand("echo {date|[-2:]}"),
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
            variables: [demoVariable("VERSION", "1.4.2")],
            blocks: [
              demoCommand("zip -r backup-v{VERSION|[::2]}.zip ~/Documents"),
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

export function VariableCountDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableCount.intro} />
      <Prose text={t.docs.variableCount.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("message", t.docs.demo.commitSubject)],
            blocks: [
              demoCommand('git commit -m "{message}"'),
              demoCommand(t.docs.demo.commitLengthCommand),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableCount.chaining} />
    </>
  );
}

export function VariableCaseDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableCase.intro} />
      <ProseTable text={t.docs.variableCase.table} />
      <Prose text={t.docs.variableCase.rebuild} />
      <Prose text={t.docs.variableCase.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("PROJECT", t.docs.demo.projectName)],
            blocks: [
              demoCommand("mkdir {PROJECT|snakecase}"),
              demoCommand('echo "{PROJECT|title}"'),
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

export function VariableStripDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableStrip.intro} />
      <ProseTable text={t.docs.variableStrip.table} />
      <Prose text={t.docs.variableStrip.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("SITE", "https://example.com/"),
              demoVariable("FILE", t.docs.demo.reportFile),
            ],
            blocks: [
              demoCommand("ping {SITE|lstrip(https://)|rstrip(/)}"),
              demoCommand("zip {FILE|rstrip(.pdf)}.zip {FILE}"),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableStrip.repeats} />
      <Prose text={t.docs.variableStrip.whitespace} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("NAME", t.docs.demo.folderName)],
            blocks: [
              demoCommand('mkdir "{NAME}"'),
              demoCommand('mkdir "{NAME|strip}"'),
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

export function MultilineReferencesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.multilineReferences.intro} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("date", "2026-07-31"),
              demoVariable("project", "commandpad"),
              demoVariable("ARCHIVE", "{;name}_{;year}_{;month}.zip"),
            ],
            blocks: [
              demoCommand('echo "Archiving {project} on {date}"'),
              demoCommand(
                "zip -r {\n\tARCHIVE\n\t; name = {project}\n\t; year = {date|[:4]}\n\t; month = {date|[5:7]}\n} ~/Documents",
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
            blocks: [demoCommand('echo "\\{user} = {user}"')],
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
