import { RAW, checkResolution } from "@/test";

checkResolution("index", {
  variables: { HOST: "api.example.com", EMOJI: "😀-x", SPACED: "a b" },
  cases: [
    ["{HOST|index(.)}", "3"],
    ["{HOST|index(api)}", "0"],
    ["{HOST|index(example.com)}", "4"],
    ["{HOST|index(missing)}", "-1"],
    // Code points, not UTF-16 units
    ["{EMOJI|index(x)}", "2"],
    ["{SPACED|index( b)}", "1"],
    ["{HOST|index(;)}", "-1"],
  ],
});

checkResolution("index fails loudly", {
  variables: { HOST: "api.example.com" },
  cases: [
    ["{HOST|index}", RAW],
    ["{HOST|index()}", RAW],
  ],
});
