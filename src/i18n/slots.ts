export const MessageSlot = {
  PROVIDER: "{provider}",
} as const;
export type MessageSlot = (typeof MessageSlot)[keyof typeof MessageSlot];

export function splitAtSlot(
  message: string,
  slot: MessageSlot,
): [before: string, after: string] {
  const index = message.indexOf(slot);
  if (index < 0) {
    return [message, ""];
  }

  return [message.slice(0, index), message.slice(index + slot.length)];
}
