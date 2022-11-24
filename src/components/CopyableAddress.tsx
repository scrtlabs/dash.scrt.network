import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Breakpoint } from "react-socks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

export default function CopyableAddress({
  address,
  explorerPrefix,
}: {
  address: string;
  explorerPrefix: string;
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <div
      style={{
        display: "flex",
        placeContent: "flex-end",
        placeItems: "center",
        gap: "0.1em",
      }}
    >
      <span>
        <a
          href={`${explorerPrefix}${address}`}
          target="_blank"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Breakpoint small down>
            {address.slice(0, 7) + "..." + address.slice(-7)}
          </Breakpoint>
          <Breakpoint medium up>
            {address}
          </Breakpoint>
        </a>
      </span>
      <CopyToClipboard
        text={address}
        onCopy={() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        }}
      >
        <button className="text-zinc-700 hover:text-white active:text-zinc-500 transition-colors">
          <FontAwesomeIcon icon={faCopy}/>
        </button>
      </CopyToClipboard>
    </div>
  );
}
