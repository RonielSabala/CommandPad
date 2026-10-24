/** A copy of `set` with `value` added when `member`, removed otherwise. */
export function withSetMember<T>(
  set: ReadonlySet<T>,
  value: T,
  member: boolean,
): Set<T> {
  const next = new Set(set);
  if (member) {
    next.add(value);
  } else {
    next.delete(value);
  }

  return next;
}

/** A copy of `record` without `key`. */
export function withoutKey<V>(
  record: Record<string, V>,
  key: string,
): Record<string, V> {
  const next = { ...record };
  delete next[key];
  return next;
}
