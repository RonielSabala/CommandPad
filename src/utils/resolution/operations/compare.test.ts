import { RAW, checkResolution } from "@/test";

checkResolution("the comparison operations", {
  variables: { ENV: "prod", TARGET: "prod" },
  cases: [
    ["{|EQUALS(prod;prod)}", "true"],
    ["{|EQUALS(prod;dev)}", "false"],
    ["{|NOTEQUALS(prod;dev)}", "true"],
    ["{|NOTEQUALS(prod;prod)}", "false"],
    ["{|EQUALSIGNORECASE(PROD;prod)}", "true"],
    ["{|EQUALS(PROD;prod)}", "false"],
    ["{|EQUALS( prod ; prod )}", "true"],
    ["{|EQUALS({ENV};{TARGET})}", "true"],
    ["{|EQUALS(;)}", "true"],
    ["{|EQUALS(a;b;c)}", "false"],
    ["{|EQUALS(a;a;a)}", "false"],
    ["{|EQUALS}", RAW],
    ["{|EQUALS(prod)}", RAW],
    ["{|equals(a;a)}", RAW],
  ],
});
