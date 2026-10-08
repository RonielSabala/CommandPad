import { RAW, checkResolution, partial } from "@/test";

checkResolution("IF", {
  variables: { ENV: "prod", FILE: "backup.tar.gz" },
  cases: [
    ["{|IF(true;yes;no)}", "yes"],
    ["{|IF(false;yes;no)}", "no"],
    ["{|IF(1;yes;no)}", "yes"],
    ["{|IF(0;yes;no)}", "no"],
    ["{|IF(true; yes ; no )}", "yes"],
    ["{|IF(true;--force)}", "--force"],
    ["{|IF(false;--force)}", ""],
    ["{|IF({|EQUALS({ENV};prod)};--confirm)}", "--confirm"],
    ["{|IF({FILE|endswith(.gz)};tar xzf;tar xf)}", "tar xzf"],
    ["{|IF(true)}", RAW],
    ["{|IF()}", RAW],
    ["{|IF(maybe;yes;no)}", RAW],
    ["{|if(true;yes)}", RAW],
  ],
});

checkResolution("IF branch references", {
  variables: { A: "1 {C}", B: "2", C: "x", DEEP: "{A}!" },
  cases: [
    ["{|IF(true;{A};{B})}", "1 x"],
    ["{|IF(false;{A};{B})}", "2"],
    ["{|IF(true;{DEEP};{B})}", "1 x!"],
    ["{|IF(true;run {A};skip)}", "run 1 x"],
    ["{|IF(true; {A} ;{B})}", "1 x"],
    ["{|IF({|EQUALS({C};x)};{A};{B})}", "1 x"],
    ["{|IF(true;{A};{B})|uppercase}", "1 X"],
    // A branch is handed back as written
    ["{|IF(true;{MISSING};{B})}", partial("{MISSING}")],
    ["{|IF(true;{A} {MISSING};{B})}", partial("1 x {MISSING}")],
    // The branch nobody took is never read
    ["{|IF(true;{A};{MISSING})}", "1 x"],
    ["{|IF(false;{MISSING};{B})}", "2"],
    // The condition is read, so it still has to resolve
    ["{|IF({MISSING};{A};{B})}", partial("{|IF({MISSING};1 x;2)}")],
    [
      "{|IF({|EQUALS({MISSING};x)};{A};{B})}",
      partial("{|IF({|EQUALS({MISSING};x)};1 x;2)}"),
    ],
  ],
});

checkResolution("references an operation reads", {
  variables: { A: "value" },
  cases: [
    ["{A|slice({MISSING};)}", RAW],
    ["{A|strip({MISSING})}", RAW],
    ["{A|replace({MISSING};x)}", RAW],
    ["{A|count({MISSING})}", RAW],
    ["{A|endswith({MISSING})}", RAW],
    ["{|EQUALS({MISSING};x)}", RAW],
    ["{|AND({MISSING};true)}", RAW],
    ["{A;name={MISSING}}", RAW],
  ],
});
