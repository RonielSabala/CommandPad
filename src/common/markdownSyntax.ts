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
  STRIKETHROUGH: "~",
  STRIKETHROUGH_ALT: "~~",
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
const RUNBOOK_REFERENCE_LABEL = "Runbook:";
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
  RUNBOOK_REFERENCE: (target: string) =>
    `${MarkdownDelimiter.BOLD}${RUNBOOK_REFERENCE_LABEL}${MarkdownDelimiter.BOLD} ${MarkdownDelimiter.CODE}${target}${MarkdownDelimiter.CODE}`,
} as const;

// The inline marks

/** The shortest run of text a pair of marks can wrap. */
const MARK_CONTENT = oneOrMoreLazy(ANY);

/** Mark content that neither starts nor ends with whitespace. */
const FLANKED_CONTENT = sequence(
  notBefore(WHITESPACE),
  MARK_CONTENT,
  notAfter(WHITESPACE),
);

/** `<mark>text<mark>`, capturing the text as `name`. */
const wrapped = (mark: string, name: string, content = MARK_CONTENT) =>
  sequence(mark, named(name, content), mark);

/** A one-character mark that isn't half of its doubled spelling. */
const lone = (mark: string) => sequence(notAfter(mark), mark, notBefore(mark));

const URL_PROTOCOL = String.raw`https?:\/\/`;
const URL_EXCLUDED = '\\s<>"{}|\\\\^`[\\]';
const URL_EXCLUDED_END = `${URL_EXCLUDED}.,;:!?()-`;

export const MarkdownToken = {
  BOLD_REGEX: globalRegex(unescaped(wrapped(Mark.BOLD, "bold"))),
  ITALIC_REGEX: globalRegex(
    either(
      unescaped(wrapped(lone(Mark.ITALIC_ALT), "italicAlt")),
      unescaped(wrapped(Mark.ITALIC, "italic")),
    ),
  ),
  STRIKETHROUGH_REGEX: globalRegex(
    either(
      unescaped(
        wrapped(Mark.STRIKETHROUGH_ALT, "strikethroughAlt", FLANKED_CONTENT),
      ),
      unescaped(
        wrapped(lone(Mark.STRIKETHROUGH), "strikethrough", FLANKED_CONTENT),
      ),
    ),
  ),
  CODE_REGEX: globalRegex(
    unescaped(
      sequence(
        named("codeFence", anyOf(Mark.CODE, Mark.CODE_ALT)),
        named("code", MARK_CONTENT),
        backreference("codeFence"),
      ),
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
  Mark.ITALIC,
  Mark.ITALIC_ALT,
  Mark.STRIKETHROUGH,
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
