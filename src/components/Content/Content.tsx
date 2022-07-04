import { useState, useEffect } from "react";
import { SecretNetworkClient } from "secretjs";
import { StyledContent } from "./styled";
import { Header } from "../Header/Header";
import { GetPrivacy } from "../GetPrivacy/GetPrivacy";
import { TokenForm } from "../TokenForm/TokenForm";
import { Footer } from "../Footer/Footer";
import { mergeStateType, Token } from "../../types";
import { notification } from "../../commons";
import { setupKeplr } from "../Helpers/keplr";

interface ContentProps {
  mergeState: mergeStateType;
  currentToken: Token;
}

export function Content({ mergeState, currentToken }: ContentProps) {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", () => {
      notification("Keplr account changed.", "success");
      setupKeplr(setSecretjs, setSecretAddress);
    });

    return () =>
      window.removeEventListener("keplr_keystorechange", () => {
        return;
      });
  }, []);

  return (
    <StyledContent>
      <Header
        secretjs={secretjs}
        secretAddress={secretAddress}
        setSecretjs={setSecretjs}
        setSecretAddress={setSecretAddress}
      />
      <div className="content-wrap">
        <GetPrivacy />
        <TokenForm
          mergeState={mergeState}
          secretjs={secretjs}
          secretAddress={secretAddress}
          setSecretjs={setSecretjs}
          setSecretAddress={setSecretAddress}
          currentToken={currentToken}
        />
      </div>
      <Footer />
    </StyledContent>
  );
}
