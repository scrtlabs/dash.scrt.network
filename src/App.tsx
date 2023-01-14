import React from "react";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { BreakpointProvider } from "react-socks";
import "shared/assets/scss/index.scss";
import "animate.css";
import { Buffer } from "buffer";
import { BrowserRouter, Route, Routes, redirect } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Pages
import { Ibc } from "ibc/Ibc";
import { Wrap } from "wrap/Wrap";
import DefaultLayout from "shared/Layouts/defaultLayout";
import { Dashboard } from "dashboard/Dashboard";
import Bridge from "bridge/Bridge";
import Apps from "apps/Apps";

// for html-head
export const websiteName = "Secret Dashboard";

globalThis.Buffer = Buffer;
declare global {
  interface Window extends KeplrWindow {}
}
window.addEventListener("keplr_keystorechange", () => {
  console.log("Key store in Keplr is changed. Refreshing page.");
  location.reload();
});

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
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
  document.getElementById("root") as HTMLElement
);
root.render(
  <BreakpointProvider>
    <HelmetProvider>
      <React.StrictMode>
        <BrowserRouter>
          <DefaultLayout>
            <App />
          </DefaultLayout>
        </BrowserRouter>
      </React.StrictMode>
    </HelmetProvider>
  </BreakpointProvider>
);

export default function App() {
  return (
    <>
      <Helmet>
        <title>{websiteName}</title>
      </Helmet>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/ibc' element={<Ibc />} />
        <Route path='/wrap' element={<Wrap />} />
        <Route path='/apps' element={<Apps />} />
        <Route path='/bridge' element={<Bridge />} />
      </Routes>
    </>
  );
}
