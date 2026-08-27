import { BooleanSyntax } from "@/common/variableSyntax";
import { RAW, checkResolution } from "@/test";

const { TRUE, FALSE } = BooleanSyntax;

const VALUES = {
  DIGITS: "8080",
  LETTERS: "api",
  MIXED: "api2",
  SPACES: "   ",
  TITLED: "Payment Gateway",
  APOSTROPHE: "Don't Stop",
  UNCASED: "API-2",
  LOWER_UNCASED: "api-2",
  ACCENTED: "café",
  ROMAN: "Ⅸ",
  PATH: "/tmp/build",
};

checkResolution("the character-class predicates", {
  variables: VALUES,
  cases: [
    ["{DIGITS|isdigit}", TRUE],
    ["{LETTERS|isdigit}", FALSE],
    ["{ROMAN|isnumeric}", TRUE],
    ["{ROMAN|isdigit}", FALSE],
    ["{LETTERS|isalpha}", TRUE],
    ["{MIXED|isalpha}", FALSE],
    ["{MIXED|isalnum}", TRUE],
    ["{PATH|isalnum}", FALSE],
    ["{SPACES|isspace}", TRUE],
    ["{LETTERS|isspace}", FALSE],
    ["{LETTERS|isascii}", TRUE],
    ["{ACCENTED|isascii}", FALSE],
  ],
});

checkResolution("the casing predicates", {
  variables: VALUES,
  cases: [
    ["{LETTERS|islower}", TRUE],
    ["{TITLED|islower}", FALSE],
    ["{LETTERS|uppercase|isupper}", TRUE],
    ["{DIGITS|isupper}", FALSE],
    ["{DIGITS|islower}", FALSE],
    ["{UNCASED|isupper}", TRUE],
    ["{LOWER_UNCASED|islower}", TRUE],
    ["{TITLED|istitle}", TRUE],
    ["{LETTERS|istitle}", FALSE],
    ["{APOSTROPHE|istitle}", TRUE],
    ["{DIGITS|istitle}", FALSE],
  ],
});

checkResolution(
  "every character-class predicate is false for the empty string",
  {
    variables: VALUES,
    cases: [
      ["{PATH|isempty}", FALSE],
      ["{SPACES|isempty}", FALSE],
      ["{PATH|strip(/tmp/build)|isempty}", TRUE],
      ["{PATH|strip(/tmp/build)|isdigit}", FALSE],
      ["{PATH|strip(/tmp/build)|isalpha}", FALSE],
      ["{PATH|strip(/tmp/build)|isspace}", FALSE],
      ["{PATH|strip(/tmp/build)|istitle}", FALSE],
      ["{PATH|strip(/tmp/build)|isascii}", TRUE],
    ],
  },
);

checkResolution("a predicate keyword is matched exactly", {
  variables: VALUES,
  cases: [
    ["{LETTERS|isdigit()}", RAW],
    ["{LETTERS|ISDIGIT}", RAW],
  ],
});
