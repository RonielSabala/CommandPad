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

function resolveThemeColors() {
  return {
    accent: resolveColor(ColorToken.ACCENT),
    accentDim: resolveColor(ColorToken.ACCENT_DIM),
    accentText: resolveColor(ColorToken.ACCENT_TEXT),
    border: resolveColor(ColorToken.BORDER),
    borderFocus: resolveColor(ColorToken.BORDER_FOCUS),
    constantText: resolveColor(ColorToken.CONSTANT_TEXT),
    danger: resolveColor(ColorToken.DANGER),
    scrollbarThumb: resolveColor(ColorToken.SCROLLBAR_THUMB),
    scrollbarThumbHover: resolveColor(ColorToken.SCROLLBAR_THUMB_HOVER),
    selection: resolveColor(ColorToken.SELECTION),
    success: resolveColor(ColorToken.SUCCESS),
    surface: resolveColor(ColorToken.SURFACE),
    surfaceAlt: resolveColor(ColorToken.SURFACE_ALT),
    textMuted: resolveColor(ColorToken.TEXT_MUTED),
    textMutedDim: resolveColor(
      ColorToken.TEXT_MUTED,
      MonacoTheme.GUIDE_DIM_OPACITY,
    ),
    textPrimary: resolveColor(ColorToken.TEXT_PRIMARY),
    textSecondary: resolveColor(ColorToken.TEXT_SECONDARY),
    warning: resolveColor(ColorToken.WARNING),
  };
}

function buildTheme(
  base: monaco.editor.BuiltinTheme,
): monaco.editor.IStandaloneThemeData {
  const c = resolveThemeColors();
  const guideActive = c.textMuted;
  const guideDim = c.textMutedDim;

  return {
    base,
    inherit: true,
    rules: [
      { token: MonacoTokenScope.JSON_KEY, foreground: c.accentText },
      { token: MonacoTokenScope.JSON_STRING, foreground: c.success },
      { token: MonacoTokenScope.JSON_NUMBER, foreground: c.constantText },
      { token: MonacoTokenScope.JSON_KEYWORD, foreground: c.constantText },
      { token: MonacoTokenScope.JSON_DELIMITER, foreground: c.textSecondary },
      {
        token: MonacoTokenScope.JSON_COMMENT,
        foreground: c.textMuted,
        fontStyle: MonacoTheme.ITALIC,
      },
    ],
    colors: {
      "editor.background": MonacoTheme.TRANSPARENT,
      "editorGutter.background": MonacoTheme.TRANSPARENT,
      "minimap.background": MonacoTheme.TRANSPARENT,

      "editor.foreground": c.textPrimary,
      "editor.placeholder.foreground": c.textMuted,
      "editorCursor.foreground": c.textPrimary,
      "editorLineNumber.foreground": c.textSecondary,
      "editorLineNumber.activeForeground": c.textPrimary,
      "editor.selectionBackground": c.selection,
      "editor.inactiveSelectionBackground": c.selection,
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
      "editorBracketMatch.border": c.textMuted,
      "editorWhitespace.foreground": c.textMuted,
      "editorOverviewRuler.border": MonacoTheme.TRANSPARENT,

      "editorError.foreground": c.danger,
      "editorWarning.foreground": c.warning,

      focusBorder: c.borderFocus,
      "editorWidget.background": c.surface,
      "editorWidget.foreground": c.textPrimary,
      "editorWidget.border": c.border,
      "editorHoverWidget.background": c.surface,
      "editorHoverWidget.border": c.border,
      "editorSuggestWidget.background": c.surface,
      "editorSuggestWidget.border": c.border,
      "editorSuggestWidget.foreground": c.textPrimary,
      "editorSuggestWidget.selectedBackground": c.accentDim,
      "editorSuggestWidget.selectedForeground": c.textPrimary,
      "editorSuggestWidget.selectedIconForeground": c.accent,
      "editorSuggestWidget.highlightForeground": c.accent,
      "editorSuggestWidget.focusHighlightForeground": c.accent,

      "menu.background": c.surface,
      "menu.foreground": c.textPrimary,
      "menu.border": c.border,
      "menu.selectionBackground": c.accentDim,
      "menu.selectionForeground": c.textPrimary,
      "menu.selectionBorder": MonacoTheme.TRANSPARENT,
      "menu.separatorBackground": c.border,

      "input.background": c.surfaceAlt,
      "input.foreground": c.textPrimary,
      "input.border": c.border,
      "scrollbarSlider.background": c.scrollbarThumb,
      "scrollbarSlider.hoverBackground": c.scrollbarThumbHover,
      "scrollbarSlider.activeBackground": c.scrollbarThumbHover,
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
