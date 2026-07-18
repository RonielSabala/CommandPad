import { MarkdownWrap } from "@/common/config";
import { usePairWrapping, wrapSelection } from "@/hooks/usePairWrapping";
import { useCallback, type KeyboardEvent } from "react";

const WRAP_BY_KEY: Record<string, string> = {
  b: MarkdownWrap.BOLD,
  i: MarkdownWrap.ITALIC,
  dead: MarkdownWrap.CODE,
  "`": MarkdownWrap.CODE,
  "´": MarkdownWrap.CODE,
};

export function useNoteFormatting(
  onChange: (value: string) => void,
): (event: KeyboardEvent<HTMLTextAreaElement>) => void {
  const handlePairWrap = usePairWrapping(onChange);

  return useCallback(
    (event) => {
      if (event.altKey) {
        return;
      }

      // bold / italic / code
      if (event.ctrlKey || event.metaKey) {
        const wrap = WRAP_BY_KEY[event.key.toLowerCase()];
        if (wrap) {
          event.preventDefault();
          wrapSelection(event.currentTarget, wrap, wrap, onChange);
        }

        return;
      }

      handlePairWrap(event);
    },
    [onChange, handlePairWrap],
  );
}
