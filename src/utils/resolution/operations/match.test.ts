import { RAW, checkResolution } from "@/test";

checkResolution("the matching operations", {
  variables: { FILE: "backup.tar.gz", PATH: "/var/log/app.log" },
  cases: [
    ["{FILE|endswith}", RAW],
    ["{FILE|endswith()}", RAW],
    ["{FILE|endswith( ; )}", RAW],
    ["{FILE|startswith(backup)}", "true"],
    ["{FILE|startswith(restore)}", "false"],
    ["{FILE|endswith(.gz)}", "true"],
    ["{FILE|contains(tar)}", "true"],
    ["{FILE|contains(zip)}", "false"],
    ["{FILE|endswith(.zip; .tar.gz)}", "true"],
    ["{FILE|endswith(.zip; .7z)}", "false"],
    ["{PATH|endswith( .log ;  .txt )}", "true"],
    ["{FILE|endswith(.gz; ; )}", "true"],
  ],
});
