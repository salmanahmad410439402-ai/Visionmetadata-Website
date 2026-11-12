import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App, { preloadInitialRoute } from "./App.tsx";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import "./index.css";
import "./styles/colors.css";
import "./styles/spacing.css";

// Recover gracefully once if a visitor's cached HTML references an outdated chunk after a new deploy
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    try {
      const reloadKey = "tagyfy_chunk_reload_once";
      if (!sessionStorage.getItem(reloadKey)) {
        event.preventDefault();
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();
      }
    } catch {
      // ignore storage errors
    }
  });
}

const rootElement = document.getElementById("root")!;
const mountApp = () => {
  createRoot(rootElement).render(
    <HelmetProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </HelmetProvider>
  );
};

// Keep the prerendered HTML visible in #root until any lazy initial workspace chunk has loaded
preloadInitialRoute(typeof window !== "undefined" ? window.location.pathname : "/").then(
  mountApp,
  mountApp
);
