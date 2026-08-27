import { BooleanSyntax } from "@/common/variableSyntax";
import { RAW, checkResolution } from "@/test";

const { TRUE, FALSE } = BooleanSyntax;

checkResolution("the logic combinators", {
  variables: { FILE: "backup.tar.gz", FLAG: "true" },
  cases: [
    ["{|AND(true;true)}", TRUE],
    ["{|AND(true;false)}", FALSE],
    ["{|AND(true;true;true)}", TRUE],
    ["{|OR(false;true)}", TRUE],
    ["{|OR(false;false)}", FALSE],
    ["{|XOR(true;false)}", TRUE],
    ["{|XOR(true;true)}", FALSE],
    ["{|XOR(true;true;true)}", TRUE],
    ["{|NOT(true)}", FALSE],
    ["{|NOT(false)}", TRUE],
    ["{|AND(1;1)}", TRUE],
    ["{|OR(0;0)}", FALSE],
    ["{|AND( true ; true )}", TRUE],
    ["{|AND({FLAG};{FILE|endswith(.gz)})}", TRUE],
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
