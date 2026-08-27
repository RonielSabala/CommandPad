import { RAW, checkResolution } from "@/test";

const WORDS = {
  SPACED: "payment gateway",
  KEBAB: "payment-gateway",
  CAMEL: "paymentGateway",
  ACRONYM: "HTTPServer",
  SENTENCE: "deploy the PAYMENT gateway",
  APOSTROPHE: "don't stop",
};

checkResolution("the case operations that rebuild a value from its words", {
  variables: WORDS,
  cases: [
    ["{SPACED|snakecase}", "payment_gateway"],
    ["{KEBAB|snakecase}", "payment_gateway"],
    ["{CAMEL|snakecase}", "payment_gateway"],
    ["{SPACED|kebabcase}", "payment-gateway"],
    ["{SPACED|camelcase}", "paymentGateway"],
    ["{SPACED|pascalcase}", "PaymentGateway"],
    ["{ACRONYM|snakecase}", "http_server"],
    ["{ACRONYM|kebabcase}", "http-server"],
  ],
});

checkResolution("the case operations that only re-case letters", {
  variables: WORDS,
  cases: [
    ["{SPACED|uppercase}", "PAYMENT GATEWAY"],
    ["{SENTENCE|lowercase}", "deploy the payment gateway"],
    ["{SENTENCE|capitalize}", "Deploy the payment gateway"],
    ["{SENTENCE|title}", "Deploy The Payment Gateway"],
    ["{APOSTROPHE|title}", "Don't Stop"],
    ["{CAMEL|swapcase}", "PAYMENTgATEWAY"],
    ["{KEBAB|uppercase}", "PAYMENT-GATEWAY"],
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
