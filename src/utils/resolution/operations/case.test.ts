import { RAW, checkResolution } from "@/test";

const WORDS = {
  SPACED: "payment gateway",
  KEBAB: "payment-gateway",
  SNAKE: "payment_gateway",
  CAMEL: "paymentGateway",
  PASCAL: "PaymentGateway",
  ACRONYM: "HTTPServer",
  DIGITS: "api2gateway",
  DIGITS_CAPPED: "api2Gateway",
  PADDED: "  spaced   out  ",
  SLASHES: "///",
  PATH: "/var/log/app",
  SENTENCE: "deploy the PAYMENT gateway",
  APOSTROPHE: "don't stop",
  CURLY: "don’t stop",
};

checkResolution("the case operations that rebuild a value from its words", {
  variables: WORDS,
  cases: [
    ["{SPACED|snakecase}", "payment_gateway"],
    ["{KEBAB|snakecase}", "payment_gateway"],
    ["{SNAKE|snakecase}", "payment_gateway"],
    ["{CAMEL|snakecase}", "payment_gateway"],
    ["{PASCAL|snakecase}", "payment_gateway"],
    ["{SPACED|kebabcase}", "payment-gateway"],
    ["{SPACED|camelcase}", "paymentGateway"],
    ["{SPACED|pascalcase}", "PaymentGateway"],
    // A capital inside a word opens a new one
    ["{ACRONYM|snakecase}", "http_server"],
    ["{ACRONYM|kebabcase}", "http-server"],
    // A digit stays inside its word
    ["{DIGITS|kebabcase}", "api2gateway"],
    ["{DIGITS_CAPPED|kebabcase}", "api2-gateway"],
    // Any run of non-letter/non-digit is a separator
    ["{PADDED|snakecase}", "spaced_out"],
    ["{PATH|camelcase}", "varLogApp"],
    ["{SLASHES|snakecase}", ""],
  ],
});

checkResolution("the case operations that only re-case letters", {
  variables: WORDS,
  cases: [
    ["{SPACED|uppercase}", "PAYMENT GATEWAY"],
    ["{SENTENCE|lowercase}", "deploy the payment gateway"],
    ["{SENTENCE|capitalize}", "Deploy the payment gateway"],
    ["{SENTENCE|title}", "Deploy The Payment Gateway"],
    // An apostrophe stays inside a word
    ["{APOSTROPHE|title}", "Don't Stop"],
    ["{CURLY|title}", "Don’T Stop"],
    // Every separator stays exactly where it was
    ["{KEBAB|title}", "Payment-Gateway"],
    ["{KEBAB|uppercase}", "PAYMENT-GATEWAY"],
    ["{CAMEL|swapcase}", "PAYMENTgATEWAY"],
    ["{DIGITS|swapcase}", "API2GATEWAY"],
  ],
});

checkResolution("a case keyword is matched exactly", {
  variables: WORDS,
  cases: [
    ["{SPACED| uppercase }", "PAYMENT GATEWAY"],
    ["{SPACED|UPPERCASE}", RAW],
    ["{SPACED|upper}", RAW],
    ["{SPACED|uppercase()}", RAW],
  ],
});
