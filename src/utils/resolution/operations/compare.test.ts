import { BooleanSyntax } from "@/common/variableSyntax";
import { RAW, checkResolution } from "@/test";

const { TRUE, FALSE } = BooleanSyntax;

checkResolution("the comparison operations", {
  variables: { ENV: "prod", TARGET: "prod" },
  cases: [
    ["{|EQUALS(prod;prod)}", TRUE],
    ["{|EQUALS(prod;dev)}", FALSE],
    ["{|NOTEQUALS(prod;dev)}", TRUE],
    ["{|NOTEQUALS(prod;prod)}", FALSE],
    ["{|EQUALSIGNORECASE(PROD;prod)}", TRUE],
    ["{|EQUALS(PROD;prod)}", FALSE],
    ["{|EQUALS( prod ; prod )}", TRUE],
    ["{|EQUALS({ENV};{TARGET})}", TRUE],
    ["{|EQUALS(;)}", TRUE],
    // A separator past the last argument is content
    ["{|EQUALS(a;b;c)}", FALSE],
    ["{|EQUALS(a;a;a)}", FALSE],
    ["{|EQUALS}", RAW],
    ["{|EQUALS(prod)}", RAW],
    ["{|equals(a;a)}", RAW],
  ],
});
