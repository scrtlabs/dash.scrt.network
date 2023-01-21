import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";
import { faucetURL } from "shared/utils/commons";
import { SecretjsContext } from "./SecretjsContext";

const FeeGrantContext = createContext(null);

export type FeeGrantStatus = "Success" | "Fail" | "Untouched";

const FeeGrantContextProvider = ({ children }) => {
  const [feeGrantStatus, setFeeGrantStatus] =
    useState<FeeGrantStatus>("Untouched");

  const { secretjs, secretAddress } = useContext(SecretjsContext);

  async function requestFeeGrant() {
    if (feeGrantStatus !== "Success") {
      fetch(faucetURL, {
        method: "POST",
        body: JSON.stringify({ Address: secretAddress }),
        headers: { "Content-Type": "application/json" },
      })
        .then(async (result) => {
          const textBody = await result.text();
          // console.log(textBody);
          if (result.ok == true) {
            setFeeGrantStatus("Success");
            toast.success(
              `Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}`
            );
          } else if (textBody == "Existing Fee Grant did not expire\n") {
            setFeeGrantStatus("Success");
            toast.success(
              `Your address ${secretAddress} already has an existing fee grant`
            );
          } else {
            setFeeGrantStatus("Fail");
            toast.error(
              `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
            );
          }
        })
        .catch((error) => {
          setFeeGrantStatus("Fail");
          toast.error(
            `Fee Grant for address ${secretAddress} failed with error: ${error}`
          );
        });
    }
  }

  return (
    <FeeGrantContext.Provider
      value={{ feeGrantStatus, setFeeGrantStatus, requestFeeGrant }}
    >
      {children}
    </FeeGrantContext.Provider>
  );
};

export { FeeGrantContext, FeeGrantContextProvider };
