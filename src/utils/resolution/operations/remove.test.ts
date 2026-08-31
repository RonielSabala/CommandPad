import { RAW, checkResolution } from "@/test";

checkResolution("remove", {
  variables: { SIZE: "1,048,576", NAME: "report-final-final.pdf" },
  cases: [
    ["{SIZE|remove(,)}", "1048576"],
    ["{NAME|remove(-final)}", "report.pdf"],
    ["{SIZE|remove(missing)}", "1,048,576"],
    ["{SIZE|remove()}", RAW],
    ["{SIZE|remove}", RAW],
    ["{SIZE|remove(,0;)}", "1,048,576"],
    ["{NAME|remove(-final)|remove(.pdf)}", "report"],
  ],
});
