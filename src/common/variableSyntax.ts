import {
  DIGIT,
  ESCAPE,
  WHITESPACE,
  anchored,
  atEnd,
  capture,
  either,
  escapeSyntax,
  globalRegex,
  group,
  noneOf,
  oneOrMore,
  optional,
  sequence,
  unescaped,
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

export const SliceSyntax = {
  OPEN: "[",
  CLOSE: "]",
  SEPARATOR: ":",
  NEGATIVE: "-",
  DEFAULT_STEP: 1,
} as const;

const Ref = escapeSyntax(VariableSyntax);
const Slice = escapeSyntax(SliceSyntax);

const NOT_BRACE = noneOf(Ref.BRACE_OPEN, Ref.BRACE_CLOSE);
const braced = (content: string) =>
  sequence(Ref.BRACE_OPEN, content, Ref.BRACE_CLOSE);

export const VariableTokenRegex = globalRegex(
  braced(
    capture(oneOrMore(group(either(NOT_BRACE, braced(zeroOrMore(NOT_BRACE)))))),
  ),
);

export const CommandVariableTokenRegex = globalRegex(
  unescaped(VariableTokenRegex.source),
);

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

const SLICE_BOUND = capture(
  sequence(optional(Slice.NEGATIVE), zeroOrMore(DIGIT)),
);
const SLICE_STEP = optional(group(sequence(Slice.SEPARATOR, SLICE_BOUND)));
const SLICE_STOP = optional(
  group(sequence(Slice.SEPARATOR, SLICE_BOUND, SLICE_STEP)),
);

export const VariableSliceRegex = new RegExp(
  anchored(sequence(Slice.OPEN, SLICE_BOUND, SLICE_STOP, Slice.CLOSE)),
);

export const CopySuffixRegex = new RegExp(
  atEnd(sequence(Ref.COPY_SUFFIX, zeroOrMore(DIGIT))),
);
