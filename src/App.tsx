import { AppRoute } from "@/common/constants/routes";
import { PageSpinner } from "@/components/common/PageSpinner";
import { useDocumentLanguage, useThemeClass } from "@/hooks/useBodyClasses";
import { useRoutePrefetch, type RouteLoader } from "@/hooks/useRoutePrefetch";
import { useMonacoBootstrap } from "@/monaco/useMonacoBootstrap";
import { useMonacoTheme } from "@/monaco/useMonacoTheme";
import { useStore } from "@/store/store";
import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

const loadWorkspace = () => import("./components/workspace/WorkspacePage");
const loadDocs = () => import("./components/docs/DocsPage");
const loadHome = () => import("./components/home/HomePage");
const loadPrivacy = () => import("./components/legal/PrivacyPage");
const loadTerms = () => import("./components/legal/TermsPage");

const WorkspacePage = lazy(async () => ({
  default: (await loadWorkspace()).WorkspacePage,
}));
const DocsPage = lazy(async () => ({ default: (await loadDocs()).DocsPage }));
const HomePage = lazy(async () => ({ default: (await loadHome()).HomePage }));
const PrivacyPage = lazy(async () => ({
  default: (await loadPrivacy()).PrivacyPage,
}));
const TermsPage = lazy(async () => ({
  default: (await loadTerms()).TermsPage,
}));

const ROUTE_LOADERS: readonly RouteLoader[] = [
  loadWorkspace,
  loadDocs,
  loadHome,
  loadPrivacy,
  loadTerms,
];

export default function App() {
  const bootstrap = useStore((state) => state.bootstrap);
  const isInitialized = useStore((state) => state.initialized);

  useThemeClass();
  useDocumentLanguage();
  useRoutePrefetch(ROUTE_LOADERS);
  useMonacoBootstrap();
  useMonacoTheme();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (isInitialized) {
      requestAnimationFrame(() => document.body.classList.add("app-ready"));
    }
  }, [isInitialized]);

  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path={AppRoute.HOME} element={<HomePage />} />
        <Route path={AppRoute.WORKSPACE} element={<WorkspacePage />} />
        <Route path={AppRoute.DOCS} element={<DocsPage />} />
        <Route path={AppRoute.PRIVACY} element={<PrivacyPage />} />
        <Route path={AppRoute.TERMS} element={<TermsPage />} />
        <Route
          path="*"
          element={<Navigate to={AppRoute.WORKSPACE} replace />}
        />
      </Routes>
    </Suspense>
  );
}
