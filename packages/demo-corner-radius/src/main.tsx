import { CssBaseline } from "@mui/joy";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@fontsource/inter/index.css";
import "@repo/css-reset/main.css";

const container = document.createElement("div");
document.body.appendChild(container);

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          body: "#0f1115",
          surface: "#1b1f24",
          popup: "#232a31",
        },
      },
    },
  },
});

export const Root = () => (
  <CssVarsProvider
    theme={theme}
    defaultMode="dark"
    modeStorageKey="demo-corner-radius-mode"
  >
    <CssBaseline />
    <App />
  </CssVarsProvider>
);

createRoot(container).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
