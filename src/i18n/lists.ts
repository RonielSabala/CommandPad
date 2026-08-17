import { MessageListConfig } from "@/common/config";
import { MarkdownDelimiter } from "@/common/markdownSyntax";
import { joinLines } from "@/utils/string";

export function codeBulletList(
  names: string[],
  more: (count: number) => string,
): string {
  const shown = names.slice(0, MessageListConfig.MAX_ITEMS);
  const items = shown.map((name) => `\`${name}\``);
  const hidden = names.length - shown.length;

  if (hidden > 0) {
    items.push(more(hidden));
  }

  return joinLines(
    items.map((item) => `${MarkdownDelimiter.LIST_BULLET} ${item}`),
  );
}
