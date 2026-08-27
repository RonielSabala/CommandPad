import { RAW, checkResolution } from "@/test";

checkResolution("count", {
  variables: { PATH: "/var/log/app", REPEATED: "aaaa" },
  cases: [
    ["{PATH|count(/)}", "3"],
    ["{PATH|count(log)}", "1"],
    ["{PATH|count(missing)}", "0"],
    ["{REPEATED|count(aa)}", "2"],
    ["{PATH|count( )}", "0"],
    ["{PATH|count()}", RAW],
    ["{PATH|count}", RAW],
  ],
});
