import {
  ANY,
  DIGIT,
  ESCAPE,
  WHITESPACE,
  anchored,
  anyOf,
  atEnd,
  atStart,
  dotAllRegex,
  either,
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
  VARIADIC: Number.POSITIVE_INFINITY,
} as const;

export const CallGroup = {
  KEYWORD: "keyword",
  ARGUMENTS: "args",
} as const;

export const SliceSyntax = {
  KEYWORD: "slice",
  ARITY: 3,
  DEFAULT_STEP: 1,
} as const;

export const OperationSyntax = {
  LEN: "len",
  KEY: "key",
  HASH: "hash",
} as const;

export const CountSyntax = {
  KEYWORD: "count",
  ARITY: 1,
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

export const FillSyntax = {
  BOTH: "fill",
  LEFT: "lfill",
  RIGHT: "rfill",
  ARITY: 2,
  MAX_TIMES: 10000,
} as const;

export const JustSyntax = {
  CENTER: "just",
  LEFT: "ljust",
  RIGHT: "rjust",
  ARITY: 2,
  MAX_WIDTH: 10000,
} as const;

export const ReplaceSyntax = {
  KEYWORD: "replace",
  ARITY: 2,
} as const;

export const RemoveSyntax = {
  KEYWORD: "remove",
  ARITY: 1,
} as const;

export const IndexSyntax = {
  KEYWORD: "index",
  ARITY: 1,
} as const;

export const InsertSyntax = {
  KEYWORD: "insert",
  ARITY: 2,
} as const;

export const DateSyntax = {
  KEYWORD: "date",
  ARITY: 1,
  DEFAULT_FORMAT: "YYYY-MM-DD",
  PAD_LENGTH: 2,
  PAD_CHAR: "0",
} as const;

export const CalcSyntax = {
  KEYWORD: "calc",
  ARITY: 1,
  PLUS: "+",
  MINUS: "-",
  MULTIPLY: "*",
  DIVIDE: "/",
  MODULO: "%",
  GROUP_OPEN: "(",
  GROUP_CLOSE: ")",
  DECIMAL_POINT: ".",
  PRECISION: 12,
} as const;

export const RoundSyntax = {
  ROUND: "round",
  FLOOR: "floor",
  CEIL: "ceil",
  ARITY: 1,
  DEFAULT_DIGITS: 0,
  MAX_DIGITS: 12,
  EXPONENT: "e",
} as const;

export const CalcGroup = {
  NUMBER: "number",
  SYMBOL: "symbol",
  SPACE: "space",
  INVALID: "invalid",
} as const;

export const DateToken = {
  YEAR: "YYYY",
  YEAR_SHORT: "YY",
  MONTH: "MM",
  DAY: "DD",
  HOUR: "HH",
  MINUTE: "mm",
  SECOND: "ss",
} as const;

export const BooleanSyntax = {
  TRUE: "true",
  FALSE: "false",
  TRUE_ALT: "1",
  FALSE_ALT: "0",
} as const;

export const TestSyntax = {
  IS_UPPER: "isupper",
  IS_LOWER: "islower",
  IS_TITLE: "istitle",
  IS_NUMERIC: "isnumeric",
  IS_DIGIT: "isdigit",
  IS_ALNUM: "isalnum",
  IS_ALPHA: "isalpha",
  IS_SPACE: "isspace",
  IS_ASCII: "isascii",
  IS_EMPTY: "isempty",
} as const;

export const MatchSyntax = {
  STARTS_WITH: "startswith",
  ENDS_WITH: "endswith",
  CONTAINS: "contains",
  ARITY: CallSyntax.VARIADIC,
} as const;

export const LogicSyntax = {
  AND: "AND",
  OR: "OR",
  XOR: "XOR",
  NOT: "NOT",
  NOT_ARITY: 1,
  ARITY: CallSyntax.VARIADIC,
} as const;

export const CompareSyntax = {
  EQUALS: "EQUALS",
  NOT_EQUALS: "NOTEQUALS",
  EQUALS_IGNORE_CASE: "EQUALSIGNORECASE",
  ARITY: 2,
} as const;

export const IfSyntax = {
  KEYWORD: "IF",
  ARITY: 3,
} as const;

const Ref = escapeSyntax(VariableSyntax);
const Call = escapeSyntax(CallSyntax);
const Operation = escapeSyntax(OperationSyntax);
const DateTok = escapeSyntax(DateToken);
const Calc = escapeSyntax(CalcSyntax);

export const EscapedBraceOpenRegex = globalRegex(
  sequence(ESCAPE, Ref.BRACE_OPEN),
);

const OPERATION_KEYWORD = named(
  CallGroup.KEYWORD,
  oneOrMore(noneOf(Call.ARGUMENT_OPEN, Call.ARGUMENT_CLOSE, WHITESPACE)),
);

export const OperationKeywordRegex = new RegExp(
  atStart(sequence(zeroOrMore(WHITESPACE), OPERATION_KEYWORD)),
);

/** One `keyword(a;b;c)` call. */
export const CallOperationRegex = dotAllRegex(
  anchored(
    sequence(
      zeroOrMore(WHITESPACE),
      OPERATION_KEYWORD,
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

const CALC_NUMBER = sequence(
  oneOrMore(DIGIT),
  optional(group(sequence(Calc.DECIMAL_POINT, oneOrMore(DIGIT)))),
);

export const CalcTokenRegex = globalRegex(
  either(
    named(CalcGroup.NUMBER, CALC_NUMBER),
    named(
      CalcGroup.SYMBOL,
      anyOf(
        Calc.PLUS,
        Calc.MULTIPLY,
        Calc.DIVIDE,
        Calc.MODULO,
        Calc.GROUP_OPEN,
        Calc.GROUP_CLOSE,
        Calc.MINUS,
      ),
    ),
    named(CalcGroup.SPACE, oneOrMore(WHITESPACE)),
    named(CalcGroup.INVALID, ANY),
  ),
);

export const NumberValueRegex = new RegExp(
  anchored(sequence(optional(anyOf(Calc.PLUS, Calc.MINUS)), CALC_NUMBER)),
);

export const LenOperationRegex = new RegExp(anchored(Operation.LEN));

export const KeyOperationRegex = new RegExp(anchored(Operation.KEY));

export const HashOperationRegex = new RegExp(anchored(Operation.HASH));

export const DateTokenRegex = globalRegex(
  either(
    DateTok.YEAR,
    DateTok.YEAR_SHORT,
    DateTok.MONTH,
    DateTok.DAY,
    DateTok.HOUR,
    DateTok.MINUTE,
    DateTok.SECOND,
  ),
);

export const CopySuffixRegex = new RegExp(
  atEnd(sequence(Ref.COPY_SUFFIX, zeroOrMore(DIGIT))),
);
