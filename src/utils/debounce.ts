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
