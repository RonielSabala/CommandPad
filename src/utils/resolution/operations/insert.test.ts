import { RAW, checkResolution } from "@/test";

checkResolution("insert", {
  variables: {
    FILE: "nginx.conf",
    WORD: "abc",
    EMOJI: "😀x",
    AT: "1",
  },
  cases: [
    ["{WORD|insert(-; 0)}", "-abc"],
    ["{WORD|insert(-; 1)}", "a-bc"],
    ["{WORD|insert(-; 3)}", "abc-"],
    // Negative indexes
    ["{WORD|insert(-; -1)}", "ab-c"],
    ["{WORD|insert(-; -3)}", "-abc"],
    // Out of range
    ["{WORD|insert(-; 99)}", "abc-"],
    ["{WORD|insert(-; -99)}", "-abc"],
    ["{WORD|insert(-; 1 + 1)}", "ab-c"],
    ["{WORD|insert(-; {AT})}", "a-bc"],
    ["{WORD|insert( ; 1)}", "a bc"],
    ["{EMOJI|insert(-; 1)}", "😀-x"],
    ["{FILE|insert(-old; {FILE|index(.)})}", "nginx-old.conf"],
  ],
});

checkResolution("insert fails loudly", {
  variables: { WORD: "abc" },
  cases: [
    ["{WORD|insert}", RAW],
    ["{WORD|insert()}", RAW],
    ["{WORD|insert(-)}", RAW],
    ["{WORD|insert(-; )}", RAW],
    ["{WORD|insert(; 1)}", RAW],
    ["{WORD|insert(-; one)}", RAW],
    ["{WORD|insert(-; 1 2)}", RAW],
  ],
});
