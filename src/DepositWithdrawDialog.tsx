import {
  CircularProgress,
  Avatar,
  Button,
  Tooltip,
  Dialog,
  Input,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import BigNumber from "bignumber.js";
import React, { useRef, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import RefreshIcon from "@mui/icons-material/Refresh";
import { SigningCosmWasmClient } from "secretjs";
import { getKeplrViewingKey, setKeplrViewingKey } from "./KeplrStuff";
import { Token } from "./config";
import { TabContext, TabPanel } from "@mui/lab";
import { viewingKeyErroString, sleep, getFeeFromGas } from "./commons";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

export default function DepositWithdrawDialog({
  token,
  secretAddress,
  balances,
  isOpen,
  setIsOpen,
}: {
  token: Token;
  secretAddress: string;
  balances: Map<string, string>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [selectedTab, setSelectedTab] = useState<string>("deposit");

  return (
    <Dialog open={isOpen} fullWidth={true} onClose={() => setIsOpen(false)}>
      <TabContext value={selectedTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={selectedTab}
            variant="fullWidth"
            onChange={(_event: React.SyntheticEvent, newSelectedTab: string) =>
              setSelectedTab(newSelectedTab)
            }
          >
            <Tab label="IBC Deposit" value={"deposit"} />
            <Tab label="IBC Withdraw" value={"withdraw"} />
          </Tabs>
        </Box>
        <TabPanel value={"deposit"}>
          <Deposit
            token={token}
            secretAddress={secretAddress}
            onSuccess={(txhash) => {
              setIsOpen(false);
              console.log("success", txhash);
            }}
            onFailure={(error) => console.error(error)}
          />
        </TabPanel>
        <TabPanel value={"withdraw"}>
          <Withdraw
            token={token}
            secretAddress={secretAddress}
            balances={balances}
            onSuccess={(txhash) => {
              setIsOpen(false);
              console.log("success", txhash);
            }}
            onFailure={(error) => console.error(error)}
          />
        </TabPanel>
      </TabContext>
    </Dialog>
  );
}
