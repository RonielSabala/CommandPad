import { BooleanSyntax } from "@/common/variableSyntax";
import { RAW, checkResolution } from "@/test";

const { TRUE, FALSE } = BooleanSyntax;

checkResolution("the matching operations", {
  variables: { FILE: "backup.tar.gz", PATH: "/var/log/app.log" },
  cases: [
    ["{FILE|endswith}", RAW],
    ["{FILE|endswith()}", RAW],
    ["{FILE|endswith( ; )}", RAW],
    ["{FILE|startswith(backup)}", TRUE],
    ["{FILE|startswith(restore)}", FALSE],
    ["{FILE|endswith(.gz)}", TRUE],
    ["{FILE|contains(tar)}", TRUE],
    ["{FILE|contains(zip)}", FALSE],
    ["{FILE|endswith(.zip; .tar.gz)}", TRUE],
    ["{FILE|endswith(.zip; .7z)}", FALSE],
    ["{PATH|endswith( .log ;  .txt )}", TRUE],
    ["{FILE|endswith(.gz; ; )}", TRUE],
  ],
});
