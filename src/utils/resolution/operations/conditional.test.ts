import { RAW, checkResolution } from "@/test";

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
    ["{|IF(true;{MISSING};{B})}", RAW],
    ["{|IF(true;{A};{MISSING})}", RAW],
  ],
});
