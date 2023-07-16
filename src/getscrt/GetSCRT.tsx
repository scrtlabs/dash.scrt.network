import {
  faArrowUpRightFromSquare,
  faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { websiteName } from "App";
import { formatNumber } from "shared/utils/commons";
import { useState, createContext, useContext, useEffect } from "react";
import { SecretjsContext } from "shared/context/SecretjsContext";
import queryString from "query-string";

function GetSCRT() {
  const { secretjs, secretAddress, connectWallet } =
    useContext(SecretjsContext);

  const [loading, setLoading] = useState(true);

  let transakQueryStrings: { [key: string]: any } = {};

  if (import.meta.env.TRANSAK_API_KEY) {
    transakQueryStrings.apiKey = import.meta.env.TRANSAK_API_KEY;
    transakQueryStrings.environment = "PRODUCTION";
  } else {
    transakQueryStrings.apiKey = "4fcd6904-706b-4aff-bd9d-77422813bbb7";
    transakQueryStrings.environment = "STAGING";
  }
  transakQueryStrings.cryptoCurrencyList = "SCRT";
  transakQueryStrings.walletAddress = secretAddress;
  transakQueryStrings.disableWalletAddressForm = false;
  transakQueryStrings.themeColor = "000000";
  transakQueryStrings.defaultCryptoCurrency = "SCRT";

  return (
    <>
      <Helmet>
        <title>{websiteName} | Get SCRT</title>
      </Helmet>
      <div className="max-w-2xl mx-auto px-6 text-neutral-600 dark:text-neutral-400 leading-7 text-justify">
        {/* Title */}
        <div className="w-full max-w-xl mx-auto px-4 onEnter_fadeInDown">
          <div className="rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 w-full text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900">
            {/* Header */}
            <div className="flex text-center mb-4 justify-center">
              <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
                Get SCRT
              </h1>
            </div>
            <div className="flex text-center mb-4 justify-center">
              <div
                style={{
                  MozAnimation: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "500px",
                  height: "80vh",
                  overflow: "hidden",
                  position: "relative",
                  margin: "auto",
                }}
              >
                {/* Loading Spinner */}
                {loading && (
                  <div className="animate-pulse">
                    <div className="bg-neutral-300/40 dark:bg-neutral-700/40 w-screen h-screen"></div>
                  </div>
                )}

                <iframe
                  src={`https://global-stg.transak.com?${queryString.stringify(
                    transakQueryStrings
                  )}`}
                  onLoad={() => setLoading(false)}
                  allow="camera;microphone;fullscreen;payment"
                  style={{
                    height: "100%",
                    width: "100%",
                    border: "none",
                    margin: "auto",
                  }}
                ></iframe>
              </div>
            </div>
            <div className="col-span-12 text-xs font-medium text-neutral-600 dark:text-neutral-400 flex justify-center">
              {`Not Available in the U.S. Use at your own risk.`}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GetSCRT;
