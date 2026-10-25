import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { CurrencyProvider } from "./context/CurrencyProvider";
import { ThemeProvider } from "./context/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </CurrencyProvider>
      </ThemeProvider>
    </MotionConfig>
  </StrictMode>
);