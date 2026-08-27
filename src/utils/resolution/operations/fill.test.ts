import { RAW, checkResolution } from "@/test";

checkResolution("fill", {
  variables: { NAME: "api", COUNT: "2" },
  cases: [
    ["{NAME|rfill(.; 3)}", "api..."],
    ["{NAME|lfill(0; 2)}", "00api"],
    ["{NAME|fill(-; 2)}", "--api--"],
    ["{NAME|rfill(.; 10 - {NAME|len})}", "api......."],
    ["{NAME|rfill(.; {COUNT})}", "api.."],
    ["{NAME|rfill(.; 0)}", "api"],
    ["{NAME|rfill( ; 2)}", "api  "],
  ],
});

checkResolution("fill fails loudly", {
  variables: { NAME: "api" },
  cases: [
    ["{NAME|rfill}", RAW],
    ["{NAME|rfill()}", RAW],
    ["{NAME|rfill(.)}", RAW],
    ["{NAME|rfill(; 3)}", RAW],
    ["{NAME|rfill(.; )}", RAW],
    ["{NAME|rfill(.; -1)}", RAW],
    ["{NAME|rfill(.; 10001)}", RAW],
    ["{NAME|rfill(.; many)}", RAW],
  ],
});
