import {
  faDesktop,
  faMobileScreen,
  faWallet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { trackMixPanelEvent } from "shared/utils/commons";

interface ISquidModalProps {
  open: boolean;
  onClose: any;
}

import { SquidWidget } from "@0xsquid/widget";

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

                  {/* <SquidWidget
          config={{
            companyName: "Custom",
            style: {
              neutralContent: "#6A61FF",
              baseContent: "#FDFDFD",
              base100: "#342C90",
              base200: "#181C63",
              base300: "#13164E",
              error: "#ED6A5E",
              warning: "#FFB155",
              success: "#62C555",
              primary: "#6C5BE0",
              secondary: "#4030FA",
              secondaryContent: "#F6F7FB",
              neutral: "#0C1536",
              roundedBtn: "8px",
              roundedBox: "12px",
              roundedDropDown: "8px",
              displayDivider: false,
            },
            slippage: 1.5,
            infiniteApproval: false,
            enableExpress: false,
            apiUrl: "https://api.squidrouter.com",
            titles: {
              swap: "Convert",
              settings: "Settings",
              wallets: "Wallets",
              tokens: "Tokens",
              chains: "Chains",
              history: "History",
              transaction: "Transaction",
              allTokens: "Tokens",
              destination: "Destination address",
            },
            priceImpactWarnings: {
              warning: 3,
              critical: 5,
            },
          }}
        />*/}

                  <iframe
                    title="squid_widget"
                    className="bg-white dark:bg-neutral-900 mx-auto w-[50vw] h-[84vh]"
                    style={{ maxWidth: "420px", maxHeight: "800px" }}
                    src="https://widget.squidrouter.com/iframe?config=%7B%22integratorId%22%3A%22squid-swap-widget%22%2C%22companyName%22%3A%22Custom%22%2C%22style%22%3A%7B%22neutralContent%22%3A%22%23959BB2%22%2C%22baseContent%22%3A%22%23E8ECF2%22%2C%22base100%22%3A%22%2310151B%22%2C%22base200%22%3A%22%23272D3D%22%2C%22base300%22%3A%22%23171D2B%22%2C%22error%22%3A%22%23ED6A5E%22%2C%22warning%22%3A%22%23FFB155%22%2C%22success%22%3A%22%232EAEB0%22%2C%22primary%22%3A%22%2371B4BD%22%2C%22secondary%22%3A%22%2371B4BD%22%2C%22secondaryContent%22%3A%22%23171717%22%2C%22neutral%22%3A%22%23171717%22%2C%22roundedBtn%22%3A%225px%22%2C%22roundedCornerBtn%22%3A%22999px%22%2C%22roundedBox%22%3A%225px%22%2C%22roundedDropDown%22%3A%227px%22%7D%2C%22slippage%22%3A1.5%2C%22infiniteApproval%22%3Afalse%2C%22enableExpress%22%3Atrue%2C%22apiUrl%22%3A%22https%3A%2F%2Fapi.squidrouter.com%22%2C%22comingSoonChainIds%22%3A%5B%22cosmoshub-4%22%2C%22injective-1%22%2C%22kichain-2%22%5D%2C%22titles%22%3A%7B%22swap%22%3A%22Swap%22%2C%22settings%22%3A%22Settings%22%2C%22wallets%22%3A%22Wallets%22%2C%22tokens%22%3A%22Select%20Token%22%2C%22chains%22%3A%22Select%20Chain%22%2C%22history%22%3A%22History%22%2C%22transaction%22%3A%22Transaction%22%2C%22allTokens%22%3A%22Select%20Token%22%2C%22destination%22%3A%22Destination%20address%22%7D%2C%22priceImpactWarnings%22%3A%7B%22warning%22%3A3%2C%22critical%22%3A5%7D%7D"
                  />
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
