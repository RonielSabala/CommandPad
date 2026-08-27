import { RAW, checkResolution } from "@/test";

checkResolution("strip", {
  variables: {
    PADDED: "  spaced  ",
    PATH: "/tmp/build/",
    REPEATED: "xxbodyxx",
  },
  cases: [
    ["{PADDED|strip}", "spaced"],
    ["{PADDED|strip()}", "spaced"],
    ["{PADDED|lstrip}", "spaced  "],
    ["{PADDED|rstrip}", "  spaced"],
    ["{PATH|strip(/)}", "tmp/build"],
    ["{PATH|lstrip(/tmp/)}", "build/"],
    ["{PATH|rstrip(/)}", "/tmp/build"],
    ["{REPEATED|strip(x)}", "body"],
    ["{REPEATED|lstrip(x)}", "bodyxx"],
    ["{PATH|strip(;)}", "/tmp/build/"],
    ["{PATH|strip(missing)}", "/tmp/build/"],
    ["{PATH|nostrip}", RAW],
  ],
});
