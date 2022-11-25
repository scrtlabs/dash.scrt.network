import React, { useState } from "react";
import { SecretNetworkClient } from "secretjs";
import { Token } from "utils/config";
import Deposit from "components/ibc/Deposit";
import Withdraw from "components/ibc/Withdraw";

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
    <div>
          <Deposit
            token={token}
            secretAddress={secretAddress}
            onSuccess={(txhash) => {
              closeDialog();
              console.log("success", txhash);
            }}
            onFailure={(error) => console.error(error)}
          />
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
    </div>
  );
}
