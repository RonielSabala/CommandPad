import { TestSyntax } from "@/common/variableSyntax";
import {
  isAlnumText,
  isAlphaText,
  isAsciiText,
  isDigitText,
  isEmptyText,
  isLowerText,
  isNumericText,
  isSpaceText,
  isTitleText,
  isUpperText,
} from "@/utils/stringTest";

import { writeBoolean } from "./boolean";
import {
  bareKeywords,
  type OperationDefinition,
  type OperationTransform,
} from "./types";

type StringTest = (text: string) => boolean;

const TESTS: Record<string, StringTest | undefined> = {
  [TestSyntax.IS_UPPER]: isUpperText,
  [TestSyntax.IS_LOWER]: isLowerText,
  [TestSyntax.IS_TITLE]: isTitleText,
  [TestSyntax.IS_NUMERIC]: isNumericText,
  [TestSyntax.IS_DIGIT]: isDigitText,
  [TestSyntax.IS_ALNUM]: isAlnumText,
  [TestSyntax.IS_ALPHA]: isAlphaText,
  [TestSyntax.IS_SPACE]: isSpaceText,
  [TestSyntax.IS_ASCII]: isAsciiText,
  [TestSyntax.IS_EMPTY]: isEmptyText,
};

function asTransform(test: StringTest): OperationTransform {
  return (text) => writeBoolean(test(text));
}

export const TEST_OPERATION: OperationDefinition = {
  keywords: bareKeywords(Object.keys(TESTS)),
  parse: (operation) => {
    const test = TESTS[operation.text.trim()];
    return test ? asTransform(test) : null;
  },
};
