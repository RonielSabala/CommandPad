/**
 * Types for the standalone service locator and the layout service.
 */

declare module "monaco-editor/esm/vs/platform/layout/browser/layoutService.js" {
  export const ILayoutService: unknown;
}

declare module "monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js" {
  export const StandaloneServices: {
    get<T>(serviceId: unknown): T;
  };
}
