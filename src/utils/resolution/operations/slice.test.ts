import { RAW, checkResolution } from "@/test";

checkResolution("slice", {
  variables: { TEXT: "abcdef", DATE: "2026-07-31", INDEX: "2" },
  cases: [
    ["{TEXT|slice(0;3)}", "abc"],
    ["{TEXT|slice(2;4)}", "cd"],
    ["{TEXT|slice(0;9;2)}", "ace"],
    ["{DATE|slice(;4)}", "2026"],
    ["{DATE|slice(5;7)}", "07"],
    ["{DATE|slice(-2;)}", "31"],
    // Each bound may be left empty for its default
    ["{TEXT|slice(;3)}", "abc"],
    ["{TEXT|slice(3;)}", "def"],
    ["{TEXT|slice(;)}", "abcdef"],
    ["{TEXT|slice(;;2)}", "ace"],
    // A negative bound counts from the end, a negative step reverses
    ["{TEXT|slice(-2;)}", "ef"],
    ["{TEXT|slice(;-2)}", "abcd"],
    ["{TEXT|slice(;;-1)}", "fedcba"],
    // Bounds clamp instead of failing
    ["{TEXT|slice(0;99)}", "abcdef"],
    ["{TEXT|slice(99;)}", ""],
    // A lone argument is a single index, not a range
    ["{TEXT|slice(3)}", "d"],
    ["{TEXT|slice(0)}", "a"],
    ["{TEXT|slice(-1)}", "f"],
    // Whitespace may sit around each number and each sign
    ["{TEXT|slice( 1 ; 4 )}", "bcd"],
    ["{TEXT|slice(1 + 1; 2 + 2)}", "cd"],
    // A bound may come from a reference
    ["{TEXT|slice({INDEX};)}", "cdef"],
    ["{TEXT|slice({INDEX} + 1;)}", "def"],
  ],
});

checkResolution("slice fails loudly", {
  variables: { TEXT: "abcdef" },
  cases: [
    ["{TEXT|slice}", RAW],
    ["{TEXT|slice()}", RAW],
    ["{TEXT|slice(  )}", RAW],
    ["{TEXT|slice(a;b)}", RAW],
    ["{TEXT|slice(1 2;)}", RAW],
    ["{TEXT|slice(0;3;0)}", RAW],
    ["{TEXT|slice(1;2;3;4)}", RAW],
  ],
});
