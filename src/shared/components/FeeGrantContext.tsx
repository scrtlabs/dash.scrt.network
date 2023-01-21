import { createContext, useState } from "react";

const FeeGrantContext = createContext(null);

export type FeeGrantStatus = 'Success' | 'Fail' | 'Untouched';

const FeeGrantContextProvider = ({children}) => {
  const [feeGrantStatus, setFeeGrantStatus] = useState<FeeGrantStatus>("Untouched");

  return (
    <FeeGrantContext.Provider value={ {feeGrantStatus, setFeeGrantStatus} }>
      {children}
    </FeeGrantContext.Provider>
  )
}

export { FeeGrantContext, FeeGrantContextProvider };