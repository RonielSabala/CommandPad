export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<Args extends any[]>(
  fn: (...args: Args) => void,
  ms: number,
) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Args): void => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
