export function toTitleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function matchesQuery(
  query: string,
  ...fields: (string | undefined)[]
): boolean {
  if (!query) {
    return true;
  }

  const needle = query.toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

export function classNames(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
