import { RAW, checkResolution } from "@/test";

checkResolution("the logic combinators", {
  variables: { FILE: "backup.tar.gz", FLAG: "true" },
  cases: [
    ["{|AND(true;true)}", "true"],
    ["{|AND(true;false)}", "false"],
    ["{|AND(true;true;true)}", "true"],
    ["{|OR(false;true)}", "true"],
    ["{|OR(false;false)}", "false"],
    ["{|XOR(true;false)}", "true"],
    ["{|XOR(true;true)}", "false"],
    ["{|XOR(true;true;true)}", "true"],
    ["{|NOT(true)}", "false"],
    ["{|NOT(false)}", "true"],
    ["{|AND(1;1)}", "true"],
    ["{|OR(0;0)}", "false"],
    ["{|AND( true ; true )}", "true"],
    ["{|AND({FLAG};{FILE|endswith(.gz)})}", "true"],
  ],
});

checkResolution("the logic combinators fail loudly", {
  variables: { FILE: "backup.tar.gz" },
  cases: [
    ["{|AND()}", RAW],
    ["{|OR()}", RAW],
    ["{|NOT()}", RAW],
    ["{|AND}", RAW],
    ["{|AND(true;maybe)}", RAW],
    ["{|NOT(true;false)}", RAW],
    ["{FILE|NOT}", RAW],
    ["{|and(true;true)}", RAW],
  ],
});
