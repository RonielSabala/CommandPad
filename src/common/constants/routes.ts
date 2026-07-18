export const AppRoute = {
  WORKSPACE: "/",
  DOCS: "/docs",
} as const;
export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];
