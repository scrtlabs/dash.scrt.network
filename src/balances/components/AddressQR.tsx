import { useContext, useEffect, useRef, useState } from "react";
import { formatNumber } from "shared/utils/commons";
import { APIContext } from "shared/context/APIContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeContext } from "shared/context/ThemeContext";
import { trackMixPanelEvent } from "shared/utils/commons";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";
import { QRCode } from "react-qrcode-logo";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { SecretjsContext } from "shared/context/SecretjsContext";
import { Token, chains, tokens } from "shared/utils/config";

export default function AddressQR() {
  const {
    bondedToken,
    setBondedToken,
    notBondedToken,
    setNotBondedToken,
    totalSupply,
    setTotalSupply,
    communityPool,
  } = useContext(APIContext);

  const { theme, setTheme } = useContext(ThemeContext);

  const { secretjs } = useContext(SecretjsContext);

  const secretToken: Token = tokens.find((token) => token.name === "SCRT");

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-xl h-full">
      <div className="flex items-center">
        <div className="flex-1 truncate font-medium text-sm">
          {secretjs && secretjs?.address && (
            <a
              href={`${chains["Secret Network"].explorer_account}${secretjs?.address}`}
              target="_blank"
            >
              {secretjs?.address}
            </a>
          )}
        </div>
        <div className="flex-initial ml-4">
          <CopyToClipboard
            text={secretjs?.address}
            onCopy={() => {
              toast.success("Address copied to clipboard!");
            }}
          >
            <Tooltip
              title={"Copy to clipboard"}
              placement="bottom"
              disableHoverListener={!secretjs && !secretjs?.address}
              arrow
            >
              <span>
                <button
                  className="text-neutral-500 enabled:hover:text-white enabled:active:text-neutral-500 transition-colors"
                  disabled={!secretjs && !secretjs?.address}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </span>
            </Tooltip>
          </CopyToClipboard>
          <QRCode
            value={secretjs?.address}
            quietZone={0}
            logoImage={`/img/assets/${secretToken.image}`}
            logoHeight={35}
            logoWidth={35}
            ecLevel={"Q"}
            removeQrCodeBehindLogo={false}
            logoPadding={1}
            logoPaddingStyle={"circle"}
            bgColor={"#000000"}
            fgColor={"#FFFFFF"}
          />
        </div>
      </div>
    </div>
  );
}
