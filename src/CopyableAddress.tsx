import { CircularProgress, Button, Typography, Tooltip } from "@mui/material";
import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { FileCopyOutlined } from "@mui/icons-material";
import { Breakpoint } from "react-socks";

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
      <Typography component={"span"} sx={{ opacity: 0.8 }}>
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
      </Typography>
      <CopyToClipboard
        text={address}
        onCopy={() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        }}
      >
        <Button style={{ color: "black", minWidth: 0 }}>
          <FileCopyOutlined
            fontSize="small"
            style={{ fill: isCopied ? "green" : undefined }}
          />
        </Button>
      </CopyToClipboard>
    </div>
  );
}
