import { MonacoLayout, XmlValidation } from "@/common/editorConfig";
import {
  ANY,
  capture,
  DIGIT,
  escapeSyntax,
  oneOrMore,
  sequence,
} from "@/common/regex";

import type { CodeProblem, CodeValidator } from "./types";

const Xml = escapeSyntax(XmlValidation);
const POSITION = capture(oneOrMore(DIGIT));

const ChromiumPositionRegex = new RegExp(
  sequence(
    Xml.CHROMIUM_LINE,
    POSITION,
    Xml.CHROMIUM_COLUMN,
    POSITION,
    Xml.CHROMIUM_MESSAGE,
    capture(oneOrMore(ANY)),
  ),
);

const FirefoxPositionRegex = new RegExp(
  sequence(Xml.FIREFOX_LINE, POSITION, Xml.FIREFOX_COLUMN, POSITION),
);

function readParserError(raw: string): CodeProblem {
  const chromium = ChromiumPositionRegex.exec(raw);
  const found = chromium ?? FirefoxPositionRegex.exec(raw);

  const line = Number(found?.[1]) || MonacoLayout.FIRST_LINE;
  const column = Number(found?.[2]) || MonacoLayout.FIRST_COLUMN;

  return {
    message: (chromium?.[3] ?? raw).trim(),
    line,
    column,
    endLine: line,
    endColumn: column + 1,
  };
}

export const validateXml: CodeValidator = (text) => {
  if (!text.trim()) {
    return [];
  }

  const document = new DOMParser().parseFromString(
    text,
    XmlValidation.MIME_TYPE,
  );

  const error = document.getElementsByTagName(XmlValidation.ERROR_TAG)[0];
  return error ? [readParserError(error.textContent ?? "")] : [];
};
