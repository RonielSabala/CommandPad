import { RAW, checkResolution, partial } from "@/test";

checkResolution("calc", {
  variables: {
    PORT: "8080",
    REPLICAS: "3",
    NEGATIVE: "-4",
    NAME: "api",
  },
  cases: [
    ["{|calc(1 + 2)}", "3"],
    ["{|calc(1 * 2 + (2 + 3))}", "7"],
    // Precedence and associativity
    ["{|calc(2 + 3 * 4)}", "14"],
    ["{|calc((2 + 3) * 4)}", "20"],
    ["{|calc(10 - 4 - 3)}", "3"],
    ["{|calc(64 / 4 / 2)}", "8"],
    ["{|calc(((1)))}", "1"],
    // Unary signs
    ["{|calc(-3 + 5)}", "2"],
    ["{|calc(2 * -3)}", "-6"],
    ["{|calc(- -3)}", "3"],
    ["{|calc(+3)}", "3"],
    ["{|calc(-(2 + 3))}", "-5"],
    // Decimals, and no float noise
    ["{|calc(7 / 2)}", "3.5"],
    ["{|calc(1.5 * 2)}", "3"],
    ["{|calc(0.1 + 0.2)}", "0.3"],
    ["{|calc(1 / 3)}", "0.333333333333"],
    ["{|calc(0 * -1)}", "0"],
    // Modulo takes the divisor's sign
    ["{|calc(7 % 3)}", "1"],
    ["{|calc(-1 % 3)}", "2"],
    ["{|calc(1 % -3)}", "-2"],
    // Whitespace is free
    ["{|calc(1+2*3)}", "7"],
    ["{| calc( 1 +\n 2 ) }", "3"],
    // Variables are resolved before the expression is read
    ["{|calc({PORT} + 1)}", "8081"],
    ["{|calc({PORT} * {REPLICAS})}", "24240"],
    ["{|calc(10 - {NEGATIVE})}", "14"],
    ["{|calc({NAME|len} * 2)}", "6"],
    // It ignores the value it is handed
    ["{NAME|calc(2 + 2)}", "4"],
    // And its result feeds a numeric argument
    ["{NAME|slice(;{|calc(4 / 2)})}", "ap"],
  ],
});

checkResolution("calc fails loudly", {
  variables: { NAME: "api" },
  cases: [
    ["{|calc}", RAW],
    ["{|calc()}", RAW],
    ["{|calc(1 +)}", RAW],
    ["{|calc(1 2)}", RAW],
    ["{|calc((1 + 2)}", RAW],
    ["{|calc(1 + 2))}", RAW],
    ["{|calc(1 / 0)}", RAW],
    ["{|calc(1 % 0)}", RAW],
    ["{|calc(2 ** 3)}", RAW],
    ["{|calc(1; 2)}", RAW],
    ["{|calc(x + 1)}", RAW],
    ["{|calc({NAME} + 1)}", partial("{|calc(api + 1)}")],
    ["{|calc({MISSING} + 1)}", RAW],
    ["{|calc(1.)}", RAW],
  ],
});
