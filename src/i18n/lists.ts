import { MessageListConfig } from "@/common/config";
import { MarkdownDelimiter } from "@/common/markdownSyntax";
import { joinLines } from "@/utils/string";

export function codeBulletList(names: string[]): string {
  const shown = names.slice(0, MessageListConfig.MAX_ITEMS);
  const items = shown.map((name) => `\`${name}\``);

  if (names.length > shown.length) {
    items.push(MessageListConfig.OVERFLOW);
  }

  return joinLines(
    items.map((item) => `${MarkdownDelimiter.LIST_BULLET} ${item}`),
  );
}
