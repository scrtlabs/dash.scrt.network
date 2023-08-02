import {
  faArrowUpRightFromSquare,
  faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  formatNumber,
  pageTitle,
  trackMixPanelEvent,
} from "shared/utils/commons";
import { useState, createContext, useContext, useEffect } from "react";
import { SecretjsContext } from "shared/context/SecretjsContext";
import queryString from "query-string";
import Select from "react-select";
import mixpanel from "mixpanel-browser";
import { Nullable } from "shared/types/Nullable";

function GetSCRT() {
  const { secretjs, secretAddress, connectWallet } =
    useContext(SecretjsContext);

  const [loading, setLoading] = useState(false);

  const [showKado, setShowKado] = useState(false);
  const [showTransak, setShowTransak] = useState(false);
  const [showExternal, setShowExternal] = useState(false);

  type SelectValue = "transak" | "kado" | "external";
  const [selectedValue, setSelectedValue] =
    useState<Nullable<SelectValue>>(null);

  let transakQueryStrings: { [key: string]: any } = {};

  useEffect(() => {
    if (selectedValue === "transak") {
      setShowKado(false);
      setShowTransak(true);
      setShowExternal(false);
    } else if (selectedValue === "kado") {
      setShowKado(true);
      setShowTransak(false);
      setShowExternal(false);
    } else if (selectedValue === "external") {
      setShowKado(false);
      setShowTransak(false);
      setShowExternal(true);
    }

    if (import.meta.env.VITE_MIXPANEL_ENABLED === "true") {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false,
      });
      mixpanel.identify("Dashboard-App");
      mixpanel.track("User selected in 'Get SCRT'!", {
        "Selected Mode": selectedValue,
      });
    }
  }, [selectedValue]);

  useEffect(() => {
    setLoading(true);
  }, [showKado, showTransak]);

  if (import.meta.env.TRANSAK_API_KEY) {
    transakQueryStrings.apiKey = import.meta.env.TRANSAK_API_KEY;
    transakQueryStrings.environment = "PRODUCTION";
  }
  transakQueryStrings.cryptoCurrencyList = "SCRT";
  transakQueryStrings.walletAddress = secretAddress;
  transakQueryStrings.disableWalletAddressForm = false;
  transakQueryStrings.themeColor = "000000";
  transakQueryStrings.defaultCryptoCurrency = "SCRT";

  interface Option {
    value: SelectValue;
    label: String;
  }

  const options: Option[] = [
    { value: "kado", label: "Kado" },
    { value: "transak", label: "Transak" },
    { value: "external", label: "More..." },
  ];

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Get SCRT</title>
      </Helmet>

      {/* <TransakModal open={false} onClose={undefined} /> */}

      <div className="max-w-2xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
            Get SCRT
          </h1>
        </div>

        <p className="mb-8  text-neutral-600 dark:text-neutral-400 leading-7 text-justify">
          You can get SCRT by swapping tokens on a{` `}
          <a
            href="https://scrt.network/ecosystem/exchanges"
            target="_blank"
            className="pb-0.5 border-b border-neutral-400 dark:border-neutral-600 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors"
          >
            DEX or CEX
          </a>
          {`, or you can buy directly with fiat using the interface below, powered by Kado and Transak.`}
        </p>

        <div className="max-w-xs mx-auto mb-8">
          <Select
            isDisabled={false}
            options={options}
            value={options.find((option) => option.value === selectedValue)}
            isSearchable={false}
            onChange={(option) => {
              setSelectedValue(option.value);
            }}
            classNamePrefix="react-select"
          />
        </div>

        {showTransak && (
          <div className="flex text-center mb-4 justify-center">
            <div
              className="overflow-hidden w-full h-[80vh] rounded-md"
              style={{
                MozAnimation: "relative",
                alignItems: "center",
              }}
            >
              {/* Loading */}
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
        )}
        {showKado && (
          <div className="flex text-center mb-4 justify-center">
            <div
              className="overflow-hidden w-full h-[80vh] rounded-md"
              style={{
                MozAnimation: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "80vh",
                overflow: "hidden",
                position: "relative",
                margin: "auto",
              }}
            >
              {/* Loading */}
              {loading && (
                <div className="animate-pulse">
                  <div className="bg-neutral-300/40 dark:bg-neutral-700/40 w-screen h-screen"></div>
                </div>
              )}
              <iframe
                src={`https://app.kado.money/?apiKey=acd1e5a5-8a25-4b2d-b303-b5e113457ef1&onRevCurrency=SCRT&product=BUY&network=SECRET&=onToAddress=${secretAddress}`}
                width="100%"
                height="100%"
                onLoad={() => setLoading(false)}
              ></iframe>
            </div>
          </div>
        )}

        {showTransak && (
          <div className="col-span-12 text-xs font-medium text-neutral-400 dark:text-neutral-500 flex justify-center">
            {`Not Available in the U.S. This is an external application. Use at your own risk.`}
          </div>
        )}

        {showKado && (
          <div className="col-span-12 text-xs font-medium text-neutral-400 dark:text-neutral-500 flex justify-center">
            {`Kado is an external application. Use at your own risk.`}
          </div>
        )}

        {showExternal && (
          <>
            <div className="text-center">
              <a
                href="https://scrt.network/about/get-scrt"
                target="_blank"
                className="text-white mx-auto my-6 p-3 text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
              >
                Open external{" "}
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="ml-1.5"
                />
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default GetSCRT;
