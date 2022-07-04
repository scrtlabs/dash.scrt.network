import { SetStateAction, useState, useEffect } from "react";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Background } from "./components/SplashBackground/SplashBackground";
import { Content } from "./components/Content/Content";
import { mergeStateType, TokenNames, TokenOptions, Token } from "./types";
import { tokenIcons } from "./assets/images";
import { getCurrentToken } from "./commons";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer } from "react-toastify";

declare global {
  interface Window extends KeplrWindow {}
}

function App() {
  const [tokenOptions, setTokenOptions] = useState<TokenOptions>({
    name: TokenNames.scrt,
    image: tokenIcons.scrt,
  });
  const [currentToken, setCurrentToken] = useState<Token>(
    getCurrentToken(tokenOptions)
  );

  useEffect(
    () => setCurrentToken(getCurrentToken(tokenOptions)),
    [tokenOptions]
  );

  const mergeState: mergeStateType = (data, value) => {
    if (typeof data === "object") {
      setTokenOptions((prevState: SetStateAction<any>) => ({
        ...prevState,
        ...data,
      }));
    } else {
      setTokenOptions((prevState) => ({ ...prevState, [data]: value }));
    }
  };

  return (
    <div className="App">
      <Background activeToken={tokenOptions.name} />
      <Content currentToken={currentToken} mergeState={mergeState} />
      <ToastContainer theme="colored" />
    </div>
  );
}

export default App;
