import { KeplrContext } from "General/Layouts/defaultLayout";
import { faucetURL } from "General/Utils/commons";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";



export function FeeGrant() {

const [useFeegrant, setUseFeegrant] = useState<boolean>(false);

const {secretjs, secretAddress} = useContext(KeplrContext);

const updateFeeGrantButton = (text: string, color: string) => {
  let btnFeeGrant = document.getElementById("grantButton");
  if (btnFeeGrant != null) {
    btnFeeGrant.style.color = color;
    btnFeeGrant.textContent = text;
  }
};

  return (
    
    <button
    id="grantButton"
    onClick={async () => {
      fetch(faucetURL, {
        method: "POST",
        body: JSON.stringify({ Address: secretAddress }),
        headers: { "Content-Type": "application/json" },
      })
        .then(async (result) => {
          const textBody = await result.text();
          console.log(textBody);
          if (result.ok == true) {
            updateFeeGrantButton("Fee Granted", "green");
            toast.success(
              `Successfully sent new fee grant (0.1 SCRT) to address ${secretAddress}`
            );
          } else if (
            textBody == "Existing Fee Grant did not expire\n"
          ) {
            updateFeeGrantButton("Fee Granted", "green");
            toast.success(
              `Your address ${secretAddress} already has an existing fee grant`
            );
          } else {
            updateFeeGrantButton("Fee Grant failed", "red");
            toast.error(
              `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
            );
          }
          setUseFeegrant(true);
        })
        .catch((error) => {
          updateFeeGrantButton("Fee Grant failed", "red");
          toast.error(
            `Fee Grant for address ${secretAddress} failed with error: ${error}`
          );
        });
    }}
    disabled={!secretAddress}
  >
    Grant fee (0.1 SCRT)
  </button>
  )
}