import { SortDirection } from "@/common/enums";

const NAME_ORDER = new Intl.Collator(undefined, { numeric: true });
export const DIRECTION_SIGN = {
  [SortDirection.ASC]: 1,
  [SortDirection.DESC]: -1,
} as const;

export const compareNames = (a: string, b: string): number =>
  NAME_ORDER.compare(a, b);

function compareInDirection(
  a: string,
  b: string,
  direction: SortDirection,
): number {
  return DIRECTION_SIGN[direction] * compareNames(a, b);
}

/** Whether the names are out of `direction` order. */
export function isOutOfOrder<T>(
  items: readonly T[],
  nameOf: (item: T) => string,
  direction: SortDirection,
): boolean {
  return items.some(
    (item, index) =>
      index > 0 &&
      compareInDirection(nameOf(items[index - 1]), nameOf(item), direction) > 0,
  );
}

/** The items in `direction` order. */
export function sortedByName<T>(
  items: readonly T[],
  nameOf: (item: T) => string,
  direction: SortDirection,
): T[] | null {
  return isOutOfOrder(items, nameOf, direction)
    ? [...items].sort((a, b) =>
        compareInDirection(nameOf(a), nameOf(b), direction),
      )
    : null;
}
