import {
  CodeMetricProperty,
  CodeToken,
  MonacoLayout,
} from "@/common/editorConfig";

export interface CodeMetrics {
  fontFamily: string;
  fontSizeBase: number;
  fontSizeSmall: number;
  lineHeightBase: number;
  lineHeightSmall: number;
  tabSize: number;
  gutterPadStart: number;
  gutterGapBefore: number;
  gutterGapAfter: number;
}

let metrics: CodeMetrics | null = null;

function readNumber(style: CSSStyleDeclaration, token: string): number {
  return parseFloat(style.getPropertyValue(token));
}

/** Resolve the code tokens once and publish the *rounded* line heights back to :root. */
export function publishCodeMetrics(): CodeMetrics {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const rootFontSize = parseFloat(style.fontSize);

  const ratio = readNumber(style, CodeToken.LINE_HEIGHT_RATIO);
  const fontSizeBase = readNumber(style, CodeToken.TEXT_BASE) * rootFontSize;
  const fontSizeSmall = readNumber(style, CodeToken.TEXT_SM) * rootFontSize;

  metrics = {
    fontFamily: style.getPropertyValue(CodeToken.FONT_MONO).trim(),
    fontSizeBase,
    fontSizeSmall,
    lineHeightBase: Math.round(fontSizeBase * ratio),
    lineHeightSmall: Math.round(fontSizeSmall * ratio),
    tabSize: readNumber(style, CodeToken.TAB_SIZE),
    gutterPadStart:
      readNumber(style, CodeToken.GUTTER_PAD_START) * rootFontSize,
    gutterGapBefore:
      readNumber(style, CodeToken.GUTTER_GAP_BEFORE) * rootFontSize,
    gutterGapAfter:
      readNumber(style, CodeToken.GUTTER_GAP_AFTER) * rootFontSize,
  };

  root.style.setProperty(
    CodeMetricProperty.LINE_HEIGHT_BASE,
    `${metrics.lineHeightBase}px`,
  );
  root.style.setProperty(
    CodeMetricProperty.LINE_HEIGHT_SMALL,
    `${metrics.lineHeightSmall}px`,
  );
  root.style.setProperty(
    CodeMetricProperty.LINE_NUMBER_CHARS,
    `${MonacoLayout.LINE_NUMBER_MIN_CHARS}`,
  );
  root.style.setProperty(
    CodeMetricProperty.GUTTER_PAD_START,
    `${metrics.gutterPadStart}px`,
  );

  return metrics;
}

export function getCodeMetrics(): CodeMetrics {
  return metrics ?? publishCodeMetrics();
}
