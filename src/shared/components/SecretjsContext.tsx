import { createContext, useState } from "react";
import { SecretNetworkClient } from "secretjs";

const SecretjsContext = createContext(null);

const SecretjsContextProvider = ({ children }: any) => {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");

  return (
    <SecretjsContext.Provider
      value={{ secretjs, setSecretjs, secretAddress, setSecretAddress }}
    >
      {children}
    </SecretjsContext.Provider>
  );
};

export { SecretjsContext, SecretjsContextProvider };
