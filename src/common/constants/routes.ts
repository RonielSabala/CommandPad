export const AppRoute = {
  HOME: "/",
  WORKSPACE: "/workspace",
  DOCS: "/docs",
  PRIVACY: "/privacy",
  TERMS: "/terms",
} as const;
export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];
