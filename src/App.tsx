import React from 'react';
import { Window as KeplrWindow } from "@keplr-wallet/types";
import ReactDOM from "react-dom";
import { BreakpointProvider } from "react-socks";
import "General/assets/scss/index.scss";
import { Buffer } from "buffer";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Pages
import { Ibc } from "Ibc/Ibc";
import { Wrap } from "Wrap/Wrap";
import DefaultLayout from 'General/Layouts/defaultLayout';

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

ReactDOM.render(
  <BreakpointProvider>
    <React.StrictMode>
      <BrowserRouter>
        <DefaultLayout>
            <App />
        </DefaultLayout>
      </BrowserRouter>
    </React.StrictMode>
  </BreakpointProvider>,
  document.getElementById("root")
);

export default function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/wrap"/>}/>
      <Route path="/ibc" element={<Ibc />}/>
      <Route path="/wrap" element={<Wrap />}/>
    </Routes>
  );
}