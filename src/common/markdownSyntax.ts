import {
  ANY,
  DIGIT,
  ESCAPE,
  WHITESPACE,
  anchored,
  anyOf,
  atEnd,
  atStart,
  backreference,
  before,
  capture,
  either,
  escapeSyntax,
  globalRegex,
  group,
  named,
  noneOf,
  notAfter,
  notBefore,
  oneOrMore,
  oneOrMoreLazy,
  optional,
  sequence,
  unescaped,
  zeroOrMore,
} from "./regex";

export const MarkdownDelimiter = {
  BOLD: "**",
  ITALIC: "_",
  ITALIC_ALT: "*",
  CODE: "`",
  CODE_ALT: "´",
  LINK_LABEL_OPEN: "[",
  LINK_LABEL_CLOSE: "]",
  LINK_HREF_OPEN: "(",
  LINK_HREF_CLOSE: ")",
  TABLE_SEPARATOR: "|",
  TABLE_ALIGN: ":",
  TABLE_FILL: "-",
  LIST_BULLET: "*",
  LIST_BULLET_ALT: "-",
  LIST_ORDINAL: ".",
} as const;

const Mark = escapeSyntax(MarkdownDelimiter);

// Markdown the app writes out

const FENCE = "```";
const IMAGE_MARKER = "!";
const link = (label: string, target: string) =>
  sequence(
    MarkdownDelimiter.LINK_LABEL_OPEN,
    label,
    MarkdownDelimiter.LINK_LABEL_CLOSE,
    MarkdownDelimiter.LINK_HREF_OPEN,
    target,
    MarkdownDelimiter.LINK_HREF_CLOSE,
  );

export const MarkdownSyntax = {
  HEADING: "#",
  SUBHEADING: "##",
  DIVIDER: "---",
  CODE_FENCE: `${FENCE}bash`,
  CODE_FENCE_END: FENCE,
  IMAGE: (alt: string, src: string) => `${IMAGE_MARKER}${link(alt, src)}`,
} as const;

// The inline marks

/** The shortest run of text a pair of marks can wrap. */
const MARK_CONTENT = oneOrMoreLazy(ANY);

/** `<mark>text<mark>`, capturing the text as `name`. */
const wrapped = (mark: string, name: string) =>
  sequence(mark, named(name, MARK_CONTENT), mark);

const LONE_ITALIC_ALT = sequence(
  notAfter(Mark.ITALIC_ALT),
  Mark.ITALIC_ALT,
  notBefore(Mark.ITALIC_ALT),
);

const URL_PROTOCOL = String.raw`https?:\/\/`;
const URL_EXCLUDED = '\\s<>"{}|\\\\^`[\\]';
const URL_EXCLUDED_END = `${URL_EXCLUDED}.,;:!?()-`;

export const MarkdownToken = {
  CODE_REGEX: globalRegex(
    unescaped(
      sequence(
        named("codeFence", anyOf(Mark.CODE, Mark.CODE_ALT)),
        named("code", MARK_CONTENT),
        backreference("codeFence"),
      ),
    ),
  ),
  BOLD_REGEX: globalRegex(unescaped(wrapped(Mark.BOLD, "bold"))),
  ITALIC_REGEX: globalRegex(
    either(
      unescaped(wrapped(LONE_ITALIC_ALT, "italicAlt")),
      unescaped(wrapped(Mark.ITALIC, "italic")),
    ),
  ),
  LINK_REGEX: globalRegex(
    unescaped(
      sequence(
        Mark.LINK_LABEL_OPEN,
        named("linkLabel", oneOrMore(noneOf(Mark.LINK_LABEL_CLOSE))),
        Mark.LINK_LABEL_CLOSE,
        Mark.LINK_HREF_OPEN,
        named(
          "linkHref",
          sequence(
            URL_PROTOCOL,
            oneOrMore(noneOf(WHITESPACE, Mark.LINK_HREF_CLOSE)),
          ),
        ),
        Mark.LINK_HREF_CLOSE,
      ),
    ),
  ),
  URL_REGEX: globalRegex(
    unescaped(
      named(
        "url",
        sequence(
          URL_PROTOCOL,
          zeroOrMore(noneOf(URL_EXCLUDED)),
          noneOf(URL_EXCLUDED_END),
        ),
      ),
    ),
  ),
} as const;

/** What a leading backslash can escape. */
const ESCAPABLE_MARKS = [
  Mark.ITALIC_ALT,
  Mark.ITALIC,
  Mark.CODE,
  Mark.CODE_ALT,
  Mark.LINK_LABEL_OPEN,
  Mark.TABLE_SEPARATOR,
  Mark.LIST_BULLET_ALT,
];

export const MarkdownEscapeRegex = globalRegex(
  either(
    sequence(ESCAPE, capture(anyOf(...ESCAPABLE_MARKS))),
    sequence(ESCAPE, before(URL_PROTOCOL)),
  ),
);

export const MarkdownTable = {
  DELIMITER_CELL_REGEX: new RegExp(
    anchored(
      sequence(
        optional(Mark.TABLE_ALIGN),
        oneOrMore(Mark.TABLE_FILL),
        optional(Mark.TABLE_ALIGN),
      ),
    ),
  ),
  SEPARATOR_REGEX: new RegExp(unescaped(Mark.TABLE_SEPARATOR)),
  TRAILING_SEPARATOR_REGEX: new RegExp(unescaped(atEnd(Mark.TABLE_SEPARATOR))),
  ESCAPED_SEPARATOR_REGEX: globalRegex(sequence(ESCAPE, Mark.TABLE_SEPARATOR)),
} as const;

export const MarkdownList = {
  FIRST_ORDINAL: 1,
  TAB_WIDTH: 4,
  ITEM_REGEX: new RegExp(
    atStart(
      sequence(
        named("indent", zeroOrMore(WHITESPACE)),
        group(
          either(
            named("bullet", either(Mark.LIST_BULLET, Mark.LIST_BULLET_ALT)),
            sequence(named("ordinal", oneOrMore(DIGIT)), Mark.LIST_ORDINAL),
          ),
        ),
        oneOrMore(WHITESPACE),
      ),
    ),
  ),
} as const;
