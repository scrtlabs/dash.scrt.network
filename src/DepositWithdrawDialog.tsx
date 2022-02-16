import { TabContext, TabPanel } from "@mui/lab";
import { Box, Dialog, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { SecretNetworkClient } from "secretjs";
import { Token } from "./config";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

export default function DepositWithdrawDialog({
  token,
  secretjs,
  secretAddress,
  balances,
  isOpen,
  setIsOpen,
}: {
  token: Token;
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
  balances: Map<string, string>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [selectedTab, setSelectedTab] = useState<string>("deposit");
  const closeDialog = () => {
    setIsOpen(false);
    setSelectedTab("deposit");
  };

  return (
    <Dialog open={isOpen} fullWidth={true} onClose={closeDialog}>
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
              closeDialog();
              console.log("success", txhash);
            }}
            onFailure={(error) => console.error(error)}
          />
        </TabPanel>
        <TabPanel value={"withdraw"}>
          <Withdraw
            token={token}
            secretjs={secretjs}
            secretAddress={secretAddress}
            balances={balances}
            onSuccess={(txhash) => {
              closeDialog();
              console.log("success", txhash);
            }}
            onFailure={(error) => console.error(error)}
          />
        </TabPanel>
      </TabContext>
    </Dialog>
  );
}
