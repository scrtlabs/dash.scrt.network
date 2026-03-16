import type { Window as KeplrWindow } from "@keplr-wallet/types";
import React, { useEffect } from "react";
import "assets/styles/index.css";
import { Buffer } from "buffer";
import { APIContextProvider } from "context/APIContext";
// Contexts
import { ThemeContextProvider } from "context/ThemeContext";
import DefaultLayout from "layouts/DefaultLayout";
// mixpanel
import mixpanel from "mixpanel-browser";
import Analytics from "pages/analytics/Analytics";
import Apps from "pages/apps/Apps";
import Bridge from "pages/bridge/Bridge";
import Dashboard from "pages/dashboard/Dashboard";
import GetSCRT from "pages/get-scrt/GetScrt";
// Pages
import { Ibc } from "pages/ibc/Ibc";
import Portfolio from "pages/portfolio/Portfolio";
import Powertools from "pages/powertools/Powertools";
import { Send } from "pages/send/Send";
import Staking from "pages/staking/Staking";
import { Wrap } from "pages/wrap/Wrap";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSecretNetworkClientStore } from "stores/secretNetworkClient.store";
import { useUserPreferencesStore } from "stores/UserPreferences.store";
import { debugModeOverride } from "utils/commons";

const { debugMode } = useUserPreferencesStore.getState();

if (import.meta.env.VITE_MIXPANEL_ENABLED === "true") {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, { debug: true });
  mixpanel.identify("Dashboard-App");

  mixpanel.track("Dashboard has been opened", {});

  if (debugMode || debugModeOverride) {
    console.debug("[Mixpanel] Enabled");
  }
} else {
  if (debugMode || debugModeOverride) {
    console.debug("[Mixpanel] Disabled");
  }
}

export const websiteName = "Secret Dashboard";

globalThis.Buffer = Buffer;
declare global {
  interface Window extends KeplrWindow {}
}
window.addEventListener("keplr_keystorechange", () => {
  location.reload();
});

class ErrorBoundary extends React.Component<
  { children: any },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error(error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <BrowserRouter>
    <ThemeContextProvider>
      <APIContextProvider>
        <DefaultLayout>
          <App />
        </DefaultLayout>
      </APIContextProvider>
    </ThemeContextProvider>
  </BrowserRouter>,
);

export default function App() {
  const { init } = useSecretNetworkClientStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/ibc" element={<Ibc />} />
      <Route path="/wrap" element={<Wrap />} />
      <Route path="/bridge" element={<Bridge />} />
      <Route path="/get-scrt" element={<GetSCRT />} />
      <Route path="/staking" element={<Staking />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/send" element={<Send />} />
      <Route path="/apps" element={<Apps />} />
      <Route path="/powertools" element={<Powertools />} />
    </Routes>
  );
}
