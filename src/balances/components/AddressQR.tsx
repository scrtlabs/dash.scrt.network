import { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeContext } from "shared/context/ThemeContext";
import { trackMixPanelEvent } from "shared/utils/commons";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";
import { QRCode } from "react-qrcode-logo";
import {
  faArrowUpRightFromSquare,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { SecretjsContext } from "shared/context/SecretjsContext";
import { Token, chains, tokens } from "shared/utils/config";
import { Link } from "react-router-dom";

export default function AddressQR() {
  const { theme, setTheme } = useContext(ThemeContext);

  const { secretjs } = useContext(SecretjsContext);

  const secretToken: Token = tokens.find((token) => token.name === "SCRT");

  return (
    <div className="group flex flex-col sm:flex-row items-center text-center sm:text-left">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col">
            {/* Address */}
            <div className="truncate font-medium text-sm mb-2">
              {secretjs && secretjs?.address && (
                <a
                  href={`${chains["Secret Network"].explorer_account}${secretjs?.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {secretjs?.address}{" "}
                </a>
              )}
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
                      className="text-neutral-500 hover:text-white active:text-neutral-500 transition-colors"
                      disabled={!secretjs && !secretjs?.address}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </span>
                </Tooltip>
              </CopyToClipboard>
            </div>

            {/* Send and Get SCRT buttons */}
            <div className="flex mt-auto">
              <Link
                to="/send"
                className="flex-1 md:px-4 inline-block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm"
                onClick={() => {
                  trackMixPanelEvent("Clicked Send SCRT");
                }}
              >
                Send
              </Link>
              <Link
                to="/get-scrt"
                className="flex-1 md:px-4 inline-block bg-cyan-500 dark:bg-cyan-500/20 text-white dark:text-cyan-200 hover:text-cyan-100 hover:bg-cyan-400 dark:hover:bg-cyan-500/50 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm ml-2"
                onClick={() => {
                  trackMixPanelEvent("Clicked Get SCRT");
                }}
              >
                Get SCRT
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="text-xs ml-2"
                />
              </Link>
            </div>
          </div>
          {/* QR Code */}
          <div className="ml-2">
            <QRCode
              value={secretjs?.address}
              quietZone={0}
              logoImage={`/img/assets/${secretToken.image}`}
              size={110}
              logoHeight={25}
              logoWidth={25}
              ecLevel={"L"}
              removeQrCodeBehindLogo={false}
              bgColor={theme === "dark" ? "#262626" : "#FFFFFF"}
              fgColor={theme === "dark" ? "#FFFFFF" : "#000000"}
              qrStyle={"dots"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
