import {
  ANY,
  DIGIT,
  ESCAPE,
  WHITESPACE,
  anchored,
  atEnd,
  capture,
  dotAllRegex,
  escapeSyntax,
  globalRegex,
  group,
  named,
  noneOf,
  oneOrMore,
  optional,
  sequence,
  zeroOrMore,
} from "./regex";

export const VariableSyntax = {
  PARAM_SEPARATOR: ";",
  PARAM_ASSIGNMENT: "=",
  OPERATION_SEPARATOR: "|",
  BRACE_OPEN: "{",
  BRACE_CLOSE: "}",
  COPY_SUFFIX: "_COPY",
} as const;

export const CallSyntax = {
  ARGUMENT_OPEN: "(",
  ARGUMENT_CLOSE: ")",
  ARGUMENT_SEPARATOR: ";",
} as const;

export const CallGroup = {
  KEYWORD: "keyword",
  ARGUMENTS: "args",
} as const;

export const SliceSyntax = {
  KEYWORD: "slice",
  ARITY: 3,
  NEGATIVE: "-",
  DEFAULT_STEP: 1,
} as const;

export const OperationSyntax = {
  COUNT: "count",
} as const;

export const CaseSyntax = {
  SNAKE: "snakecase",
  KEBAB: "kebabcase",
  CAMEL: "camelcase",
  PASCAL: "pascalcase",
  CAPITALIZE: "capitalize",
  TITLE: "title",
  LOWER: "lowercase",
  UPPER: "uppercase",
  SWAP: "swapcase",
} as const;

export const StripSyntax = {
  BOTH: "strip",
  LEFT: "lstrip",
  RIGHT: "rstrip",
  ARITY: 1,
} as const;

const Ref = escapeSyntax(VariableSyntax);
const Call = escapeSyntax(CallSyntax);
const Slice = escapeSyntax(SliceSyntax);
const Operation = escapeSyntax(OperationSyntax);

const braced = (content: string) =>
  sequence(Ref.BRACE_OPEN, content, Ref.BRACE_CLOSE);

export const EscapedBraceOpenRegex = globalRegex(
  sequence(ESCAPE, Ref.BRACE_OPEN),
);

export const VariableParamPlaceholderRegex = globalRegex(
  braced(
    sequence(
      Ref.PARAM_SEPARATOR,
      capture(oneOrMore(noneOf(Ref.BRACE_CLOSE, Ref.PARAM_SEPARATOR))),
    ),
  ),
);

export const TokenWhitespaceRegex = globalRegex(oneOrMore(WHITESPACE));

/** One `keyword(a;b;c)` call. */
export const CallOperationRegex = dotAllRegex(
  anchored(
    sequence(
      zeroOrMore(WHITESPACE),
      named(
        CallGroup.KEYWORD,
        oneOrMore(noneOf(Call.ARGUMENT_OPEN, Call.ARGUMENT_CLOSE, WHITESPACE)),
      ),
      zeroOrMore(WHITESPACE),
      optional(
        group(
          sequence(
            Call.ARGUMENT_OPEN,
            named(CallGroup.ARGUMENTS, zeroOrMore(ANY)),
            Call.ARGUMENT_CLOSE,
          ),
        ),
      ),
      zeroOrMore(WHITESPACE),
    ),
  ),
);

export const SliceBoundRegex = new RegExp(
  anchored(sequence(optional(Slice.NEGATIVE), zeroOrMore(DIGIT))),
);

export const CountOperationRegex = new RegExp(anchored(Operation.COUNT));

export const CopySuffixRegex = new RegExp(
  atEnd(sequence(Ref.COPY_SUFFIX, zeroOrMore(DIGIT))),
);
