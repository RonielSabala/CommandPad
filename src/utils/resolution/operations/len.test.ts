import { RAW, checkResolution } from "@/test";

checkResolution("len", {
  variables: {
    COMMIT_MESSAGE: "fix: keep the caret inside the command block",
    EMOJI: "a\u{1F600}b",
    BLANK: "   ",
  },
  cases: [
    ["{COMMIT_MESSAGE|len}", "44"],
    ["{COMMIT_MESSAGE| len }", "44"],
    ["{BLANK|len}", "3"],
    ["{EMOJI|len}", "3"],
    ["{COMMIT_MESSAGE|slice(0;3)|len}", "3"],
    ["{COMMIT_MESSAGE|LEN}", RAW],
    ["{COMMIT_MESSAGE|length}", RAW],
    ["{COMMIT_MESSAGE|len()}", RAW],
  ],
});
