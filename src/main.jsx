import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { AuthProvider } from "./hooks/useAuth";
import App from "./App.jsx";

Sentry.init({
  dsn: "https://140f26ab1eaa49d8b033dd380419c38d@app.glitchtip.com/27195",
  tracesSampleRate: 0.01,
  autoSessionTracking: false,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
