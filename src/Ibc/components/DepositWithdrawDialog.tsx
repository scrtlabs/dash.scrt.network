import React, { useState } from "react";
import { SecretNetworkClient } from "secretjs";
import { Token } from "General/Utils/config";
import Deposit from "Ibc/components/Deposit";
import Withdraw from "Ibc/components/Withdraw";

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
            onSuccess={(txhash) => {
              closeDialog();
              console.log("success", txhash);
            }}
            onFailure={(error) => console.error(error)}
          />
          <Withdraw
            token={token}
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
