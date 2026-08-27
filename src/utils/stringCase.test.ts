import { describe, expect, it } from "vitest";

import {
  capitalizeText,
  splitWords,
  swapCase,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
  toTitleCase,
  upperFirst,
} from "./stringCase";

describe("splitWords", () => {
  it.each([
    ["payment gateway", ["payment", "gateway"]],
    ["payment-gateway", ["payment", "gateway"]],
    ["payment_gateway", ["payment", "gateway"]],
    ["paymentGateway", ["payment", "Gateway"]],
    ["PaymentGateway", ["Payment", "Gateway"]],
    ["HTTPServer", ["HTTP", "Server"]],
    // A digit stays inside its word; only a capital after one opens a new word
    ["api2gateway", ["api2gateway"]],
    ["api2Gateway", ["api2", "Gateway"]],
    ["  spaced   out  ", ["spaced", "out"]],
    ["", []],
    ["///", []],
  ])("%s -> %s", (text, expected) => {
    expect(splitWords(text)).toEqual(expected);
  });
});

describe("upperFirst", () => {
  it("uppercases the first character and leaves the rest alone", () => {
    expect(upperFirst("hello World")).toBe("Hello World");
    expect(upperFirst("")).toBe("");
  });
});

describe("the cases that rebuild a value from its words", () => {
  it.each([
    ["payment gateway", "payment_gateway"],
    ["paymentGateway", "payment_gateway"],
    ["HTTPServer", "http_server"],
  ])("toSnakeCase(%s) -> %s", (text, expected) => {
    expect(toSnakeCase(text)).toBe(expected);
  });

  it("spells the same words the other three ways", () => {
    expect(toKebabCase("payment gateway")).toBe("payment-gateway");
    expect(toCamelCase("payment gateway")).toBe("paymentGateway");
    expect(toPascalCase("payment gateway")).toBe("PaymentGateway");
  });

  it("drops the separators it split on", () => {
    expect(toCamelCase("/var/log/app")).toBe("varLogApp");
  });
});

describe("the cases that only re-case letters", () => {
  it("lowercases the rest of the value, like Python capitalize", () => {
    expect(capitalizeText("deploy the PAYMENT gateway")).toBe(
      "Deploy the payment gateway",
    );
  });

  it("lowercases the rest of each word, like Python title", () => {
    expect(toTitleCase("deploy the PAYMENT gateway")).toBe(
      "Deploy The Payment Gateway",
    );
  });

  it("keeps an apostrophe inside a word, unlike Python", () => {
    expect(toTitleCase("don\u2019t stop")).toBe("Don\u2019T Stop");
    expect(toTitleCase("don't stop")).toBe("Don't Stop");
  });

  it("leaves every separator exactly where it was", () => {
    expect(toTitleCase("payment-gateway")).toBe("Payment-Gateway");
  });

  it("swaps each letter's case", () => {
    expect(swapCase("paymentGateway")).toBe("PAYMENTgATEWAY");
    expect(swapCase("42!")).toBe("42!");
  });
});
