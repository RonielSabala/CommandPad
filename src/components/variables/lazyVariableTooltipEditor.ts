import { lazy } from "react";

const loadEditor = () => import("./VariableTooltipEditor");

export const LazyVariableTooltipEditor = lazy(async () => ({
  default: (await loadEditor()).VariableTooltipEditor,
}));

export const preloadVariableTooltipEditor = () => void loadEditor();
