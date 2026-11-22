import App from "@/App";
import { LanguageProvider } from "@/i18n";
import {
  completeCloudAuthRedirect,
  isCloudAuthRedirect,
} from "@/services/cloud/authRedirect";
import "@/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

function renderApp(): void {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

if (isCloudAuthRedirect()) {
  void completeCloudAuthRedirect().then((relayed) => {
    if (!relayed) {
      renderApp();
    }
  });
} else {
  renderApp();
}
