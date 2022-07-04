import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GlobalStyle, theme } from "./globalstyles";
import { ThemeProvider } from "styled-components";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <App />
    <GlobalStyle />
  </ThemeProvider>
);
