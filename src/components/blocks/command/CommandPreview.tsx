import {
  CARRIAGE_RETURN,
  COPY_FEEDBACK_TIMEOUT_MS,
  LINE_BREAK,
  NON_BREAKING_SPACE,
} from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { ClampSurface, TooltipVariant } from "@/common/enums";
import type { CommandSegment } from "@/common/types";
import { ClampToggle } from "@/components/common/codeEditor/ClampToggle";
import { useDomScrollTarget } from "@/components/common/scrollTarget";
import { StickyScrollbar } from "@/components/common/StickyScrollbar";
import { useRichTooltip } from "@/components/common/tooltip/richTooltip";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { useClampSurface } from "@/hooks/useClampSurface";
import { useTranslation } from "@/i18n";
import {
  countCommandLines,
  hasUnresolvedSegments,
  isMaskedSegment,
  resolveCommandText,
  resolveCommandToString,
  sourceKey,
  type VariableMap,
} from "@/utils/resolution";
import { classNames, splitLines, stripEnd } from "@/utils/string";
import {
  Fragment,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import "./CommandPreview.css";
import { VariableSourceTooltip } from "./VariableSourceTooltip";

const SECRET_MASK = "******";

/** The tooltip props for a span written by `source`. */
type SourceProps = (source: string | undefined) => object;

const plainSourceProps: SourceProps = (source) =>
  tooltip(source, TooltipVariant.CODE);

function HighlightedLines({
  text,
  className,
  props,
}: {
  text: string;
  className: string;
  props: object;
}) {
  const lines = splitLines(text);
  const lastLineIdx = lines.length - 1;

  return lines.map((line, i) => {
    const content = stripEnd(line, CARRIAGE_RETURN);
    const isBlank = content === "" && i > 0 && i < lastLineIdx;

    return (
      <Fragment key={i}>
        {i > 0 && LINE_BREAK}
        {(content !== "" || isBlank) && (
          <span
            className={classNames(className, isBlank && "token-nesting-blank")}
            {...props}
          >
            {isBlank ? NON_BREAKING_SPACE : content}
          </span>
        )}
      </Fragment>
    );
  });
}

function NestedText({
  segment,
  sourceProps,
}: {
  segment: CommandSegment;
  sourceProps: SourceProps;
}) {
  const spans = segment.spans;
  if (!spans) {
    return segment.text;
  }

  return spans.map((span, i) => (
    <HighlightedLines
      key={i}
      text={span.text}
      className={classNames(
        `token-nesting-${span.depth}`,
        span.unresolved ? "token-nesting-unresolved" : "token-nesting-resolved",
      )}
      props={sourceProps(span.source ?? segment.key)}
    />
  ));
}

interface Props {
  clampId: string;
  text: string;
  variableMap: VariableMap;
  secretKeys: Set<string>;
  surfaceRef: RefObject<HTMLElement | null>;
  actions?: ReactNode;
  /** Offer to jump to the variable behind a span. */
  linkSources?: boolean;
}

export function CommandPreview({
  clampId,
  text,
  variableMap,
  secretKeys,
  surfaceRef,
  actions,
  linkSources,
}: Props) {
  const t = useTranslation();
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLSpanElement>(null);
  const previewScrollTarget = useDomScrollTarget(previewRef);

  const sourceTip = useRichTooltip();
  const sourceTipProps = sourceTip.props;
  const sourceProps = useCallback<SourceProps>(
    (source) =>
      source && Object.hasOwn(variableMap, sourceKey(source))
        ? { ...tooltip(source, TooltipVariant.CODE), ...sourceTipProps }
        : plainSourceProps(source),
    [variableMap, sourceTipProps],
  );

  const segments = useMemo(
    () => resolveCommandText(text, variableMap),
    [text, variableMap],
  );
  const lines = useMemo(
    () => countCommandLines(segments, secretKeys),
    [segments, secretKeys],
  );
  const unresolved = useMemo(() => hasUnresolvedSegments(segments), [segments]);
  const clamp = useClampSurface(
    clampId,
    ClampSurface.PREVIEW,
    lines,
    surfaceRef,
  );

  const copy = () => {
    const resolved = resolveCommandToString(text, variableMap);
    void navigator.clipboard.writeText(resolved).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_TIMEOUT_MS);
    });
  };

  return (
    <div className="command-preview" {...{ [DataAttr.DRAG_IMAGE]: "" }}>
      <span
        ref={previewRef}
        className={classNames(
          "command-preview-text",
          unresolved && "has-unresolved",
          CssClass.NO_LIGATURES,
          clamp.clamped && CssClass.CLAMPED,
        )}
      >
        {text ? (
          segments.map((seg, i) =>
            isMaskedSegment(seg, secretKeys) ? (
              <span key={i} className="token-secret">
                {SECRET_MASK}
              </span>
            ) : (
              <span key={i} className={`token-${seg.type}`}>
                <NestedText
                  segment={seg}
                  sourceProps={linkSources ? sourceProps : plainSourceProps}
                />
              </span>
            ),
          )
        ) : (
          <span className="command-preview-placeholder">
            {t.command.emptyPreview}
          </span>
        )}
      </span>

      <div className={`command-preview-actions ${CssClass.SELECT_KEY_HIDDEN}`}>
        {actions}

        <button
          className={CssClass.BTN}
          onClick={copy}
          disabled={!text}
          aria-label={t.command.copy}
          {...tooltip(t.command.copy)}
        >
          {copied ? (
            <CheckIcon
              className={classNames(
                "copy-check-icon",
                CssClass.ICON_MD,
                CssClass.ICON_BOLD,
              )}
            />
          ) : (
            <CopyIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          )}
        </button>
      </div>

      {clamp.overflows && (
        <ClampToggle expanded={clamp.expanded} onToggle={clamp.toggle} />
      )}

      <StickyScrollbar target={previewScrollTarget} deps={[segments]} />

      {linkSources &&
        sourceTip.render((tip) => (
          <VariableSourceTooltip
            source={tip.anchor.getAttribute(DataAttr.TOOLTIP) ?? ""}
            resolved={
              !tip.anchor.classList.contains("token-nesting-unresolved")
            }
            tip={tip}
          />
        ))}
    </div>
  );
}
