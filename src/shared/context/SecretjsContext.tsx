import { createContext, useState } from "react";
import GetWalletModal from "./GetWalletModal";
import ConnectWalletModal from "./ConnectWalletModal";
import { trackMixPanelEvent } from "shared/utils/commons";

const SecretjsContext = createContext(null);

const SecretjsContextProvider = ({ children }: any) => {
  const [isGetWalletModalOpen, setIsGetWalletModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  return (
    <SecretjsContext.Provider
      value={{
        isGetWalletModalOpen,
        setIsGetWalletModalOpen,
        isConnectModalOpen,
        setIsConnectModalOpen,
      }}
    >
      <GetWalletModal
        open={isGetWalletModalOpen}
        onClose={() => {
          trackMixPanelEvent("Closed Get Wallet Modal");
          setIsGetWalletModalOpen(false);
          document.body.classList.remove("overflow-hidden");
        }}
      />
      <ConnectWalletModal
        open={isConnectModalOpen}
        onClose={() => {
          trackMixPanelEvent("Closed Connect Wallet Modal");
          setIsConnectModalOpen(false);
          document.body.classList.remove("overflow-hidden");
        }}
      />
      {children}
    </SecretjsContext.Provider>
  );
};

export { SecretjsContext, SecretjsContextProvider };
