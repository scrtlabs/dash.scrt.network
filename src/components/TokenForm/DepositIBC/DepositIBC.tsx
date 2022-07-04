import { DropDownMenu } from "../../DropDownMenu/DropDownMenu";
import { Token, Chain } from "../../../types";
import { ChainList } from "../../../config";
import { CopyableAddress } from "../CopyableAddress/CopyableAddress";
import { Button } from "../../Button/Button";
import { useEffect, useRef, useState } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { depositTx } from "./depositTx";
import { getIBCBalance } from "../../Helpers/data";
import { fixedBalance } from "../../Helpers/format";
import { setupCosmjs } from "../../Helpers/cosm";
import { Loader } from "../../Loader/Loader";
import { rootIcons } from "../../../assets/images";

interface DepositProps {
  secretAddress: string;
  currentToken: Token;
}

export const DepositIBC = ({ secretAddress, currentToken }: DepositProps) => {
  const [addressIBC, setAdressIBC] = useState<string>("");
  const [balanceIBC, setBalanceIBC] = useState<string>("0");

  const [loadingDeposit, setLoadingDeposit] = useState<boolean>(false);
  const [loadingBalanceIBC, setLoadingBalanceIBC] = useState<boolean>(false);

  const [cosmjs, setCosmjs] = useState<SigningStargateClient | null>(null);
  const [selectedChainIndex, setSelectedChainIndex] = useState<number>(0);

  const [targetChain, setTargetChain] = useState<Chain>(
    ChainList[currentToken.deposits[0].source_chain_name]
  );
  const inputRef = useRef<any>();

  useEffect(() => {
    setAdressIBC("");
    setBalanceIBC("0");
    if (currentToken.name !== "SCRT") {
      setSelectedChainIndex(0);
      setupCosmjs(
        setCosmjs,
        setAdressIBC,
        ChainList[currentToken.deposits[0].source_chain_name],
        currentToken
      );
    } else {
      setupCosmjs(
        setCosmjs,
        setAdressIBC,
        ChainList[currentToken.deposits[selectedChainIndex].source_chain_name],
        currentToken
      );
      setTargetChain(
        ChainList[currentToken.deposits[selectedChainIndex].source_chain_name]
      );
    }
  }, [currentToken, targetChain]);

  useEffect(() => {
    if (addressIBC) {
      getIBCBalance(
        addressIBC,
        currentToken,
        selectedChainIndex,
        setBalanceIBC,
        setLoadingBalanceIBC
      );
    }
  }, [addressIBC]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="deposit-block">
        <p>Deposit {currentToken.name} from</p>
        {currentToken.name === "SCRT" ? (
          <DropDownMenu
            currentToken={currentToken}
            selectedChainIndex={selectedChainIndex}
            setSelectedChainIndex={setSelectedChainIndex}
            setTargetChain={setTargetChain}
            tab={"deposits"}
          />
        ) : (
          <span className="one">
            {ChainList[currentToken.deposits[0].source_chain_name].chain_name}
          </span>
        )}
      </div>

      <CopyableAddress
        title="From"
        address={addressIBC}
        prefix={targetChain!.explorer_account}
      />
      <CopyableAddress
        title="To"
        address={secretAddress}
        prefix={ChainList["Secret Network"].explorer_account}
      />

      <div className="available">
        <span className="title">Available Balance:</span>
        <span className="cash">
          {loadingBalanceIBC ? (
            <Loader />
          ) : (
            <span className="available-deposit">
              {`${fixedBalance(balanceIBC, currentToken.decimals)} ${
                currentToken.name
              }`}
            </span>
          )}
        </span>
        <img
          className="refresh"
          src={rootIcons.refresh}
          alt="refresh"
          onClick={() =>
            getIBCBalance(
              addressIBC,
              currentToken,
              selectedChainIndex,
              setBalanceIBC,
              setLoadingBalanceIBC
            )
          }
        />
      </div>

      <div className="amount">
        <input ref={inputRef} placeholder="Amount to Deposit" />
        <img src={currentToken.image} alt="amount" />
      </div>

      <Button
        action={() => {
          currentToken.name === "SCRT"
            ? depositTx(
                cosmjs,
                inputRef,
                targetChain,
                addressIBC,
                secretAddress,
                currentToken,
                selectedChainIndex,
                loadingDeposit,
                setLoadingDeposit,
                setBalanceIBC,
                setLoadingBalanceIBC
              )
            : depositTx(
                cosmjs,
                inputRef,
                ChainList[
                  currentToken.deposits[selectedChainIndex].source_chain_name
                ],
                addressIBC,
                secretAddress,
                currentToken,
                selectedChainIndex,
                loadingDeposit,
                setLoadingDeposit,
                setBalanceIBC,
                setLoadingBalanceIBC
              );
        }}
        text={"deposit"}
        isLoading={loadingDeposit}
      />
    </div>
  );
};
