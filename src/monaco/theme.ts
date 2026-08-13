import {
  ColorToken,
  MonacoTheme,
  MonacoTokenScope,
} from "@/common/editorConfig";
import { Theme } from "@/common/enums";
import { monaco } from "./setup";

const HEX_RADIX = 16;
const HEX_DIGITS = 2;
const CHANNEL_MAX = 255;
const OPAQUE = 1;
const NUMBER_PATTERN = /[\d.]+/g;

let probe: HTMLElement | null = null;

/** Resolve a color token to literal hex, scaling alpha by `opacity`. */
function resolveColor(token: string, opacity: number = OPAQUE): string {
  if (!probe) {
    probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
  }

  probe.style.color = `var(${token})`;

  const parts = getComputedStyle(probe).color.match(NUMBER_PATTERN) ?? [];
  const [red = 0, green = 0, blue = 0, alpha = OPAQUE] = parts.map(Number);

  return `#${[red, green, blue, alpha * opacity * CHANNEL_MAX]
    .map((channel) =>
      Math.round(channel).toString(HEX_RADIX).padStart(HEX_DIGITS, "0"),
    )
    .join("")}`;
}

function buildTheme(
  base: monaco.editor.BuiltinTheme,
): monaco.editor.IStandaloneThemeData {
  const guideActive = resolveColor(ColorToken.TEXT_MUTED);
  const guideDim = resolveColor(
    ColorToken.TEXT_MUTED,
    MonacoTheme.GUIDE_DIM_OPACITY,
  );

  return {
    base,
    inherit: true,
    rules: [
      {
        token: MonacoTokenScope.JSON_KEY,
        foreground: resolveColor(ColorToken.ACCENT_TEXT),
      },
      {
        token: MonacoTokenScope.JSON_STRING,
        foreground: resolveColor(ColorToken.SUCCESS),
      },
      {
        token: MonacoTokenScope.JSON_NUMBER,
        foreground: resolveColor(ColorToken.CONSTANT_TEXT),
      },
      {
        token: MonacoTokenScope.JSON_KEYWORD,
        foreground: resolveColor(ColorToken.CONSTANT_TEXT),
      },
      {
        token: MonacoTokenScope.JSON_DELIMITER,
        foreground: resolveColor(ColorToken.TEXT_SECONDARY),
      },
      {
        token: MonacoTokenScope.JSON_COMMENT,
        foreground: resolveColor(ColorToken.TEXT_MUTED),
        fontStyle: MonacoTheme.ITALIC,
      },
    ],
    colors: {
      "editor.background": MonacoTheme.TRANSPARENT,
      "editorGutter.background": MonacoTheme.TRANSPARENT,
      "minimap.background": MonacoTheme.TRANSPARENT,

      "editor.foreground": resolveColor(ColorToken.TEXT_PRIMARY),
      "editor.placeholder.foreground": resolveColor(ColorToken.TEXT_MUTED),
      "editorCursor.foreground": resolveColor(ColorToken.TEXT_PRIMARY),
      "editorLineNumber.foreground": resolveColor(ColorToken.TEXT_SECONDARY),
      "editorLineNumber.activeForeground": resolveColor(
        ColorToken.TEXT_PRIMARY,
      ),
      "editor.selectionBackground": resolveColor(ColorToken.SELECTION),
      "editor.inactiveSelectionBackground": resolveColor(ColorToken.SELECTION),
      "editor.selectionHighlightBackground": MonacoTheme.TRANSPARENT,

      "editorIndentGuide.background1": guideDim,
      "editorIndentGuide.activeBackground1": guideActive,
      "editorBracketPairGuide.background1": guideDim,
      "editorBracketPairGuide.background2": guideDim,
      "editorBracketPairGuide.background3": guideDim,
      "editorBracketPairGuide.background4": guideDim,
      "editorBracketPairGuide.background5": guideDim,
      "editorBracketPairGuide.background6": guideDim,
      "editorBracketPairGuide.activeBackground1": guideActive,
      "editorBracketPairGuide.activeBackground2": guideActive,
      "editorBracketPairGuide.activeBackground3": guideActive,
      "editorBracketPairGuide.activeBackground4": guideActive,
      "editorBracketPairGuide.activeBackground5": guideActive,
      "editorBracketPairGuide.activeBackground6": guideActive,

      "editorBracketMatch.background": MonacoTheme.TRANSPARENT,
      "editorBracketMatch.border": resolveColor(ColorToken.TEXT_MUTED),
      "editorWhitespace.foreground": resolveColor(ColorToken.TEXT_MUTED),
      "editorOverviewRuler.border": MonacoTheme.TRANSPARENT,

      "editorError.foreground": resolveColor(ColorToken.DANGER),
      "editorWarning.foreground": resolveColor(ColorToken.WARNING),

      focusBorder: resolveColor(ColorToken.BORDER_FOCUS),
      "editorWidget.background": resolveColor(ColorToken.SURFACE),
      "editorWidget.foreground": resolveColor(ColorToken.TEXT_PRIMARY),
      "editorWidget.border": resolveColor(ColorToken.BORDER),
      "editorHoverWidget.background": resolveColor(ColorToken.SURFACE),
      "editorHoverWidget.border": resolveColor(ColorToken.BORDER),
      "editorSuggestWidget.background": resolveColor(ColorToken.SURFACE),
      "editorSuggestWidget.border": resolveColor(ColorToken.BORDER),
      "editorSuggestWidget.foreground": resolveColor(ColorToken.TEXT_PRIMARY),
      "editorSuggestWidget.selectedBackground": resolveColor(
        ColorToken.ACCENT_DIM,
      ),
      "editorSuggestWidget.highlightForeground": resolveColor(
        ColorToken.ACCENT,
      ),
      "input.background": resolveColor(ColorToken.SURFACE_ALT),
      "input.foreground": resolveColor(ColorToken.TEXT_PRIMARY),
      "input.border": resolveColor(ColorToken.BORDER),
      "scrollbarSlider.background": resolveColor(ColorToken.SCROLLBAR_THUMB),
      "scrollbarSlider.hoverBackground": resolveColor(
        ColorToken.SCROLLBAR_THUMB_HOVER,
      ),
      "scrollbarSlider.activeBackground": resolveColor(
        ColorToken.SCROLLBAR_THUMB_HOVER,
      ),
    },
  };
}

export function monacoThemeName(theme: Theme): string {
  return theme === Theme.LIGHT ? MonacoTheme.LIGHT : MonacoTheme.DARK;
}

const defined = new Set<string>();

function defineTheme(theme: Theme): string {
  const name = monacoThemeName(theme);

  monaco.editor.defineTheme(
    name,
    buildTheme(
      theme === Theme.LIGHT ? MonacoTheme.BASE_LIGHT : MonacoTheme.BASE_DARK,
    ),
  );

  defined.add(name);
  return name;
}

export function ensureMonacoTheme(theme: Theme): string {
  const name = monacoThemeName(theme);
  return defined.has(name) ? name : defineTheme(theme);
}

export function applyMonacoTheme(theme: Theme): void {
  monaco.editor.setTheme(defineTheme(theme));
}
