import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import "./index.css";
import "./styles/colors.css";
import "./styles/spacing.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);