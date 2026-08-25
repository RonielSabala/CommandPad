import { StandaloneServices } from "monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js";
import { ILayoutService } from "monaco-editor/esm/vs/platform/layout/browser/layoutService.js";

import { getHoverRoot } from "./layers";

interface LayoutService {
  getContainer(window: Window): HTMLElement;
}

let routed = false;

/**
 * Render the tooltips Monaco's own widgets raise into the body-level hover
 * layer instead of into the editor, which every code surface clips.
 */
export function routeHoversToHoverLayer(): void {
  if (routed) {
    return;
  }

  routed = true;

  const layoutService = StandaloneServices.get<LayoutService>(ILayoutService);
  layoutService.getContainer = () => getHoverRoot();
}
