import {
  faDesktop,
  faMobileScreen,
  faWallet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { trackMixPanelEvent } from "shared/utils/commons";
import { SquidWidget } from "@0xsquid/widget";
import queryString from "query-string";

interface ISquidModalProps {
  open: boolean;
  onClose: any;
  theme: any;
}

const SquidStringsDark = {
  integratorId: "squid-swap-widget",
  companyName: "Custom",
  style: {
    neutralContent: "#959BB2",
    baseContent: "#E8ECF2",
    base100: "#10151B",
    base200: "#272D3D",
    base300: "#171D2B",
    error: "#ED6A5E",
    warning: "#FFB155",
    success: "#2EAEB0",
    primary: "#71B4BD",
    secondary: "#71B4BD",
    secondaryContent: "#171717",
    neutral: "#171717",
    roundedBtn: "5px",
    roundedCornerBtn: "999px",
    roundedBox: "5px",
    roundedDropDown: "7px",
  },
  slippage: 0.5,
  infiniteApproval: false,
  enableExpress: true,
  apiUrl: "https://api.squidrouter.com",
  comingSoonChainIds: ["cosmoshub-4", "injective-1", "kichain-2"],
  titles: {
    swap: "Swap",
    settings: "Settings",
    wallets: "Wallets",
    tokens: "Select Token",
    chains: "Select Chain",
    history: "History",
    transaction: "Transaction",
    allTokens: "Select Token",
    destination: "Destination address",
  },
  priceImpactWarnings: {
    warning: 3,
    critical: 5,
  },
  initialFromChainId: 1,
  initialToChainId: "secret-4",
};

const SquidStringsLight = {
  integratorId: "squid-swap-widget",
  companyName: "Custom",
  style: {
    neutralContent: "#747379",
    baseContent: "#2E2C33",
    base100: "#F5F5F7",
    base200: "#F2F2F2",
    base300: "#DADADA",
    error: "#ED6A5E",
    warning: "#FFB155",
    success: "#2EAEB0",
    primary: "#2E2C33",
    secondary: "#070707",
    secondaryContent: "#FFFFFF",
    neutral: "#FFFFFF",
    roundedBtn: "999px",
    roundedCornerBtn: "999px",
    roundedBox: "1rem",
    roundedDropDown: "999px",
  },
  slippage: 0.5,
  infiniteApproval: false,
  enableExpress: true,
  apiUrl: "https://api.squidrouter.com",
  comingSoonChainIds: ["cosmoshub-4", "injective-1", "kichain-2"],
  titles: {
    swap: "Swap",
    settings: "Settings",
    wallets: "Wallets",
    tokens: "Select Token",
    chains: "Select Chain",
    history: "History",
    transaction: "Transaction",
    allTokens: "Select Token",
    destination: "Destination address",
  },
  priceImpactWarnings: {
    warning: 3,
    critical: 5,
  },
  initialFromChainId: 1,
  initialToChainId: "secret-4",
};

class SquidModal extends React.Component<ISquidModalProps> {
  render() {
    if (!this.props.open) return null;

    return (
      <>
        {/* Outer */}
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 dark:bg-black/80 z-50 flex items-center justify-center"
          onClick={this.props.onClose}
        >
          {/* Inner */}
          <div className="relative py-[6rem] w-full onEnter_fadeInDown h-full overflow-scroll scrollbar-hide flex items-center justify-center">
            <div className="mx-auto max-w-xl px-4">
              <div
                className="bg-white dark:bg-neutral-900 p-8 rounded-2xl"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {/* Header */}
                <div className="mb-0 text-right">
                  <button
                    onClick={this.props.onClose}
                    className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors px-1.5 py-1 rounded-lg text-xl"
                  >
                    <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                  </button>

                  {this.props.theme == "dark" ? (
                    <iframe
                      title="squid_widget"
                      className="bg-white dark:bg-neutral-900 mx-auto w-[50vw] h-[84vh]"
                      style={{ maxWidth: "420px", maxHeight: "800px" }}
                      src={`https://widget.squidrouter.com/iframe?config=${encodeURIComponent(
                        JSON.stringify(SquidStringsDark)
                      )}`}
                    />
                  ) : (
                    <iframe
                      title="squid_widget"
                      className="bg-white dark:bg-neutral-900 mx-auto w-[50vw] h-[84vh]"
                      style={{ maxWidth: "420px", maxHeight: "800px" }}
                      src={`https://widget.squidrouter.com/iframe?config=${encodeURIComponent(
                        JSON.stringify(SquidStringsLight)
                      )}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default SquidModal;
