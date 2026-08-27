const TEST_ORIGIN = "http://localhost";

if (!("window" in globalThis)) {
  Object.defineProperty(globalThis, "window", {
    value: { location: { origin: TEST_ORIGIN } },
    writable: true,
  });
}
