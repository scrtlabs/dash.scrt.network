import {
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FeeGrantContext, KeplrContext } from "shared/Layouts/defaultLayout";
import { faucetURL } from "shared/Utils/commons";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";

export function FeeGrant() {
  const { feeGrantStatus, setFeeGrantStatus } = useContext(FeeGrantContext);

  const [useFeegrant, setUseFeegrant] = useState<boolean>(false);

  const { secretjs, secretAddress } = useContext(KeplrContext);

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
          setUseFeegrant(true);
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
    <>
      {/* Untouched */}
      {feeGrantStatus === "Untouched" && (
        <button
          id='feeGrantButton'
          onClick={() => requestFeeGrant()}
          className='font-semibold text-xs bg-neutral-900 px-1.5 py-1 rounded-md transition-colors hover:bg-neutral-700 focus:bg-neutral-500 cursor-pointer disabled:text-neutral-500 disabled:hover:bg-neutral-900 disabled:cursor-default'
          disabled={!secretjs || !secretAddress}
        >
          Request Fee Grant
        </button>
      )}
    </>
  );
}
