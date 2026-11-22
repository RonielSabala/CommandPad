const CHAR_FLAG_TABLE_SIZE = 128;

/** A table giving each ASCII character the OR of the flags declared for it. */
export function charFlagTable(
  entries: readonly (readonly [char: string, flag: number])[],
): Uint8Array {
  const table = new Uint8Array(CHAR_FLAG_TABLE_SIZE);

  for (const [char, flag] of entries) {
    const code = char.charCodeAt(0);
    if (char.length !== 1 || code >= CHAR_FLAG_TABLE_SIZE) {
      throw new RangeError(`Not a single ASCII character: ${char}`);
    }

    table[code] |= flag;
  }

  return table;
}

/** The flags of the character at `index`. */
export function charFlagsAt(
  table: Uint8Array,
  text: string,
  index: number,
): number {
  const code = text.charCodeAt(index);
  return code < CHAR_FLAG_TABLE_SIZE ? table[code] : 0;
}
