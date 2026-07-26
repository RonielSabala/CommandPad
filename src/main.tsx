import App from "@/App";
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
        <App />
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
