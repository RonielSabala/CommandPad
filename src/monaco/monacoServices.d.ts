/**
 * Types for the standalone service locator, the layout service and the editor
 * contribution registry.
 */

declare module "monaco-editor/esm/vs/platform/layout/browser/layoutService.js" {
  export const ILayoutService: unknown;
}

declare module "monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js" {
  export const StandaloneServices: {
    get<T>(serviceId: unknown): T;
  };
}

declare module "monaco-editor/esm/vs/editor/browser/editorExtensions.js" {
  export const EditorExtensionsRegistry: {
    getEditorContributions: () => { id: string }[];
  };
}
