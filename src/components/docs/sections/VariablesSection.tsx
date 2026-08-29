import { CodeLanguage, VaultPrompt } from "@/common/enums";
import { BlocksList } from "@/components/blocks/BlocksList";
import { useTranslation } from "@/i18n";
import { demoCommand, demoVariable } from "../demos/demoSeeds";
import { DemoVariableRows, DemoWorkspace } from "../demos/DemoWorkspace";
import { Prose } from "../Prose";

export function VariablesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variables.why} />
      <Prose text={t.docs.variables.intro} />
      <Prose text={t.docs.variables.usage} />
      <Prose text={t.docs.variables.demoHint(t.variables.actions)} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("server", "192.168.1.50")],
            blocks: [
              demoCommand("ping {server}", undefined, CodeLanguage.BASH),
              demoCommand("ssh admin@{server}", undefined, CodeLanguage.BASH),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variables.extract(t.command.extractVariable)} />
      <Prose text={t.docs.variables.constants} />
      <Prose text={t.docs.variables.constantsDemoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("endpoint", "health"),
              demoVariable("API_URL", "https://api.example.com"),
            ],
            blocks: [
              demoCommand(
                "curl {API_URL}/{endpoint}",
                undefined,
                CodeLanguage.BASH,
              ),
            ],
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

export function SecretVariablesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose
        text={t.docs.secretVariables.intro(
          t.variables.actions,
          t.variables.mask(1),
        )}
      />
      <Prose text={t.docs.secretVariables.copyNote} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("password", "s3cr3t-value", true)],
            blocks: [
              demoCommand(
                "zip -r -P {password} backup.zip ~/Documents",
                undefined,
                CodeLanguage.BASH,
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

export function SecretEncryptionDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.secretEncryption.intro} />
      <Prose
        text={t.docs.secretEncryption.passphrase(
          t.vaultModal.submit[VaultPrompt.CREATE],
        )}
      />
      <Prose text={t.docs.secretEncryption.covered} />
      <Prose text={t.docs.secretEncryption.unlocking} />
      <Prose
        text={t.docs.secretEncryption.changing(
          t.vaultModal.title[VaultPrompt.CHANGE],
        )}
      />
      <Prose text={t.docs.secretEncryption.markdownWarning} />
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
            blocks: [
              demoCommand(
                "curl {BASE_URL}/health",
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableReferences.shades} />
      <Prose text={t.docs.variableReferences.shadesDemoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("NAME", "api"),
              demoVariable("SERVICE", "svc-{NAME}"),
              demoVariable("HOST", "{SERVICE}.example.com"),
            ],
            blocks: [
              demoCommand(
                "curl https://{HOST}/health",
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableReferences.shadesHover} />
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
            blocks: [
              demoCommand(
                "cd {PROJECT;name=commandpad}",
                undefined,
                CodeLanguage.BASH,
              ),
            ],
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
              demoCommand(
                'echo "{GREETING;name=Sam;place=CommandPad}"',
                undefined,
                CodeLanguage.BASH,
              ),
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
              demoCommand(
                "cd {FOLDER;name={project}}",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "git clone https://github.com/user/{project}",
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.parameterizedPlaceholders.chained} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("LOG_DIR", "/var/log/{;service}"),
              demoVariable(
                "LOG_FILE",
                "{LOG_DIR;service={;service}}/current.log",
              ),
            ],
            blocks: [
              demoCommand(
                "tail -f {LOG_FILE;service=api}",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "cd {LOG_DIR;service=web}",
                undefined,
                CodeLanguage.BASH,
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
              demoCommand(
                "git checkout {commit}",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "git tag release-{commit|slice(;7)}",
                undefined,
                CodeLanguage.BASH,
              ),
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
              demoCommand(
                "echo {date|slice(;4)}",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "echo {date|slice(5;7)}",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "echo {date|slice(-2;)}",
                undefined,
                CodeLanguage.BASH,
              ),
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
              demoCommand(
                "zip -r backup-v{VERSION|slice(;;2)}.zip ~/Documents",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "echo {VERSION|slice(;;-1)}",
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableSlicing.math} />
      <Prose text={t.docs.variableSlicing.invalid} />
      <Prose text={t.docs.variableSlicing.python} />
    </>
  );
}

export function VariableLenDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableLen.intro} />
      <Prose text={t.docs.variableLen.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("message", t.docs.demo.commitSubject)],
            blocks: [
              demoCommand(
                'git commit -m "{message}"',
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                t.docs.demo.commitLengthCommand,
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableLen.chaining} />
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
            variables: [demoVariable("PATH", "/var/log/app/errors.log")],
            blocks: [
              demoCommand(
                'echo "{PATH} is {PATH|count(/)} levels deep"',
                undefined,
                CodeLanguage.BASH,
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

export function VariableKeyDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableKey.intro} />
      <Prose text={t.docs.variableKey.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("PORT", "8080")],
            blocks: [
              demoCommand(
                'echo "{PORT|key}={PORT}"',
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableKey.chaining} />
    </>
  );
}

export function VariableCaseDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableCase.intro} />
      <Prose text={t.docs.variableCase.table} />
      <Prose text={t.docs.variableCase.rebuild} />
      <Prose text={t.docs.variableCase.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("PROJECT", t.docs.demo.projectName)],
            blocks: [
              demoCommand(
                "mkdir {PROJECT|snakecase}",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                'echo "{PROJECT|title}"',
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableCase.renameHint(t.variables.renameCase)} />
    </>
  );
}

export function VariableStripDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableStrip.intro} />
      <Prose text={t.docs.variableStrip.table} />
      <Prose text={t.docs.variableStrip.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("SITE", "https://example.com/"),
              demoVariable("FILE", t.docs.demo.reportFile),
            ],
            blocks: [
              demoCommand(
                "ping {SITE|lstrip(https://)|rstrip(/)}",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "zip {FILE|rstrip(.pdf)}.zip {FILE}",
                undefined,
                CodeLanguage.BASH,
              ),
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
              demoCommand('mkdir "{NAME}"', undefined, CodeLanguage.BASH),
              demoCommand('mkdir "{NAME|strip}"', undefined, CodeLanguage.BASH),
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

export function VariableFillDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableFill.intro} />
      <Prose text={t.docs.variableFill.table} />
      <Prose text={t.docs.variableFill.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("STATUS", "OK")],
            blocks: [
              demoCommand(
                'echo "{STATUS|fill(*; 3)}"',
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableFill.rules} />
      <Prose text={t.docs.variableFill.computedHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("SERVICE", "api-gateway")],
            blocks: [
              demoCommand(
                'echo "{SERVICE|rfill(.; 20 - {SERVICE|len})} restarted"',
                undefined,
                CodeLanguage.BASH,
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

export function PlaceholderDefaultsDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.placeholderDefaults.intro} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable(
                "LOGFILE",
                "tail -f /var/log/{;service=api}/{;service}.log",
              ),
            ],
            blocks: [
              demoCommand("{LOGFILE}"),
              demoCommand("{LOGFILE;service=web}"),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.placeholderDefaults.override} />
      <Prose text={t.docs.placeholderDefaults.shared} />
    </>
  );
}

export function TransformedPlaceholdersDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.transformedPlaceholders.intro} />
      <Prose text={t.docs.transformedPlaceholders.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [demoVariable("BRANCH", "feature/{;name|kebabcase}")],
            blocks: [
              demoCommand(
                "git switch -c {BRANCH;name=Fix Login Retry}",
                undefined,
                CodeLanguage.BASH,
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

export function UnnamedReferencesDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.unnamedReferences.intro} />
      <Prose text={t.docs.unnamedReferences.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoCommand(
                'echo "Length: {|len}"',
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.unnamedReferences.rule} />
      <Prose text={t.docs.unnamedReferences.anywhere} />
    </>
  );
}

export function VariableDateDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableDate.intro} />
      <Prose text={t.docs.variableDate.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoCommand(
                "mkdir backup-{|date()}",
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableDate.format} />
      <Prose text={t.docs.variableDate.table} />
      <Prose text={t.docs.variableDate.formatDemoHint(t.docs.demo.reset)} />
      <DemoWorkspace
        tabs={[
          {
            blocks: [
              demoCommand(
                'echo "Saved at {|date(HH:mm:ss)}"',
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableDate.clock} />
    </>
  );
}

export function VariableBooleanDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableBoolean.intro} />
      <Prose text={t.docs.variableBoolean.table} />
      <Prose text={t.docs.variableBoolean.matching} />
      <Prose text={t.docs.variableBoolean.matchTable} />
      <Prose text={t.docs.variableBoolean.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("PORT", "8080"),
              demoVariable("ARCHIVE", "logs.tar.gz"),
            ],
            blocks: [
              demoCommand(
                'echo "port is a number: {PORT|isdigit}"',
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                'echo "archive is compressed: {ARCHIVE|endswith(.zip; .tar.gz)}"',
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableBoolean.empty} />
    </>
  );
}

export function VariableLogicDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableLogic.table} />
      <Prose text={t.docs.variableLogic.compare} />
      <Prose text={t.docs.variableLogic.compareTable} />
      <Prose text={t.docs.variableLogic.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("BRANCH", "main"),
              demoVariable("PORT", "8080"),
            ],
            blocks: [
              demoCommand(
                'echo "ready to deploy: {|AND({|EQUALS({BRANCH}; main)}; {PORT|isdigit})}"',
                undefined,
                CodeLanguage.BASH,
              ),
            ],
          },
        ]}
      >
        <DemoVariableRows />
        <BlocksList />
      </DemoWorkspace>
      <Prose text={t.docs.variableLogic.booleans} />
    </>
  );
}

export function VariableConditionalDocs() {
  const t = useTranslation();

  return (
    <>
      <Prose text={t.docs.variableConditional.intro} />
      <Prose text={t.docs.variableConditional.table} />
      <Prose text={t.docs.variableConditional.demoHint} />
      <DemoWorkspace
        tabs={[
          {
            variables: [
              demoVariable("LEVEL", "debug"),
              demoVariable("RETRIES", "3"),
            ],
            blocks: [
              demoCommand(
                "run.sh {|IF({|EQUALSIGNORECASE({LEVEL}; debug)}; --verbose)}",
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "curl https://api.example.com {|IF({RETRIES|isdigit}; --retry {RETRIES})}",
                undefined,
                CodeLanguage.BASH,
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
              demoCommand(
                'echo "Archiving {project} on {date}"',
                undefined,
                CodeLanguage.BASH,
              ),
              demoCommand(
                "zip -r {\n\tARCHIVE\n\t; name = {project}\n\t; year = {date|slice(;4)}\n\t; month = {date|slice(5;7)}\n} ~/Documents",
                undefined,
                CodeLanguage.BASH,
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
            blocks: [
              demoCommand(
                'echo "\\{user} = {user}"',
                undefined,
                CodeLanguage.BASH,
              ),
            ],
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
