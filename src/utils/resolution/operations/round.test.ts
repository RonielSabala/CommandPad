import { RAW, checkResolution, partial } from "@/test";

checkResolution("round, floor and ceil", {
  variables: {
    PRICE: "3.14159",
    HALF: "2.5",
    NEGATIVE_HALF: "-2.5",
    NEGATIVE: "-3.7",
    BYTES: "5767168",
    TRICKY: "1.005",
    WHOLE: "42",
    PADDED: " 7.5 ",
    SIGNED: "+1.5",
    DIGITS: "2",
    SCIENTIFIC: "1.5e3",
    TINY: "2.5E-7",
  },
  cases: [
    ["{PRICE|round}", "3"],
    ["{PRICE|round()}", "3"],
    ["{PRICE|round(2)}", "3.14"],
    ["{PRICE|round( 3 )}", "3.142"],
    // Half rounds away from zero
    ["{HALF|round}", "3"],
    ["{NEGATIVE_HALF|round}", "-3"],
    // No float noise
    ["{TRICKY|round(2)}", "1.01"],
    ["{PRICE|floor}", "3"],
    ["{PRICE|ceil}", "4"],
    ["{PRICE|floor(2)}", "3.14"],
    ["{PRICE|ceil(2)}", "3.15"],
    ["{NEGATIVE|floor}", "-4"],
    ["{NEGATIVE|ceil}", "-3"],
    ["{NEGATIVE|round}", "-4"],
    // Negative digit count
    ["{BYTES|round(-3)}", "5767000"],
    ["{WHOLE|ceil(-1)}", "50"],
    // Trailing zeros are not kept
    ["{WHOLE|round(2)}", "42"],
    ["{PADDED|round}", "8"],
    ["{SIGNED|round}", "2"],
    // The digit count is a numeric argument
    ["{PRICE|round({DIGITS} + 1)}", "3.142"],
    // Chained after calc
    ["{|calc({BYTES} / 1048576)|round(1)}", "5.5"],
    ["{|calc(0 - 0.4)|round}", "0"],
    // Scientific notation
    ["{SCIENTIFIC|round}", "1500"],
    ["{TINY|round(7)}", "3e-7"],
    ["{TINY|round(3)}", "0"],
    ["{PRICE|round(2e0)}", "3.14"],
    ["{|calc(1 / 10000000)|round(9)}", "1e-7"],
    ["{|calc(1 / 10000000)|round(3)}", "0"],
  ],
});

checkResolution("round fails loudly", {
  variables: { NAME: "api", PRICE: "3.14", EXPRESSION: "1 + 2", EMPTY: "" },
  cases: [
    ["{NAME|round}", RAW],
    ["{EXPRESSION|round}", RAW],
    ["{EMPTY|round}", RAW],
    ["{|round}", RAW],
    ["{PRICE|round(1.5)}", RAW],
    ["{PRICE|round(x)}", RAW],
    ["{PRICE|round(13)}", RAW],
    ["{PRICE|ROUND}", RAW],
    // What applied before the failure is shown resolved
    ["{NAME|uppercase|round}", partial("{API|round}")],
  ],
});
