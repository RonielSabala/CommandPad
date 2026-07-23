import { AppRoute } from "@/common/constants/routes";
import { useDocumentLanguage, useThemeClass } from "@/hooks/useBodyClasses";
import { useStore } from "@/store/store";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { DocsPage } from "./components/docs/DocsPage";
import { HomePage } from "./components/home/HomePage";
import { PrivacyPage } from "./components/legal/PrivacyPage";
import { TermsPage } from "./components/legal/TermsPage";
import { WorkspacePage } from "./components/workspace/WorkspacePage";

export default function App() {
  const bootstrap = useStore((state) => state.bootstrap);
  const isInitialized = useStore((state) => state.initialized);

  useThemeClass();
  useDocumentLanguage();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (isInitialized) {
      requestAnimationFrame(() => document.body.classList.add("app-ready"));
    }
  }, [isInitialized]);

  return (
    <Routes>
      <Route path={AppRoute.HOME} element={<HomePage />} />
      <Route path={AppRoute.WORKSPACE} element={<WorkspacePage />} />
      <Route path={AppRoute.DOCS} element={<DocsPage />} />
      <Route path={AppRoute.PRIVACY} element={<PrivacyPage />} />
      <Route path={AppRoute.TERMS} element={<TermsPage />} />
      <Route path="*" element={<Navigate to={AppRoute.WORKSPACE} replace />} />
    </Routes>
  );
}
