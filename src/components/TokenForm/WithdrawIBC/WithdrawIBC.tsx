import { ChainList } from "../../../config";
import { Token, Chain } from "../../../types";
import { SecretNetworkClient } from "secretjs";
import { DropDownMenu } from "../../DropDownMenu/DropDownMenu";
import { CopyableAddress } from "../CopyableAddress/CopyableAddress";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Button } from "../../Button/Button";
import { useEffect, useRef, useState } from "react";
import { fixedBalance } from "../../Helpers/format";
import { getTokenBalance } from "../../Helpers/data";
import { setupCosmjs } from "../../Helpers/cosm";
import { withdrawTx } from "./withdrawTx";
import { Loader } from "../../Loader/Loader";

interface WithdrawProps {
  currentToken: Token;
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
}

export const WithdrawIBC = ({
  currentToken,
  secretjs,
  secretAddress,
}: WithdrawProps) => {
  const [addressIBC, setAdressIBC] = useState<string>("");
  const [balanceIBC, setBalanceIBC] = useState<string>("0");
  const [tokenBalance, setTokenBalance] = useState<string>("0");

  const [loadingWithdrawal, setLoadingWithdrawal] = useState<boolean>(false);
  const [loadingTokenBalance, setLoadingTokenBalance] =
    useState<boolean>(false);
  const [cosmjs, setCosmjs] = useState<SigningStargateClient | null>(null);
  const [selectedChainIndex, setSelectedChainIndex] = useState<number>(0);

  const inputRef = useRef<any>();

  const [targetChain, setTargetChain] = useState<Chain>(
    ChainList[currentToken.deposits[0].source_chain_name]
  );

  useEffect(() => {
    setBalanceIBC("0");
    currentToken;
    if (currentToken.name !== "SCRT") {
      setSelectedChainIndex(0);
      setupCosmjs(
        setCosmjs,
        setAdressIBC,
        ChainList[currentToken.deposits[0].source_chain_name],
        currentToken
      );
      getTokenBalance(
        currentToken,
        secretAddress,
        setTokenBalance,
        setLoadingTokenBalance
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
    getTokenBalance(
      currentToken,
      secretAddress,
      setTokenBalance,
      setLoadingTokenBalance
    );
  }, [addressIBC]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="deposit-block">
        <p>Withdraw {currentToken.name} to</p>
        {currentToken.name === "SCRT" ? (
          <DropDownMenu
            currentToken={currentToken}
            selectedChainIndex={selectedChainIndex}
            setSelectedChainIndex={setSelectedChainIndex}
            setTargetChain={setTargetChain}
            tab={"withdrawals"}
          />
        ) : (
          <span className="one">{targetChain!.chain_name}</span>
        )}
      </div>

      <CopyableAddress
        title="From"
        address={secretAddress}
        prefix={ChainList["Secret Network"].explorer_account}
      />
      <CopyableAddress
        title="To"
        address={addressIBC}
        prefix={targetChain!.explorer_account}
      />
      <div className="available">
        <span className="title">Available Balance:</span>
        <span className="cash">
          {loadingTokenBalance ? (
            <Loader />
          ) : (
            <span className="available-withdrawal">
              {`${fixedBalance(tokenBalance, currentToken.decimals)} ${
                currentToken.name
              }`}
            </span>
          )}
        </span>
      </div>

      <div className="amount">
        <input ref={inputRef} placeholder="Amount to Withdraw" />
        <img src={currentToken.image} alt="amount" />
      </div>

      <Button
        action={() => {
          currentToken.name === "SCRT"
            ? withdrawTx(
                secretjs,
                inputRef,
                targetChain,
                addressIBC,
                secretAddress,
                currentToken,
                selectedChainIndex,
                loadingWithdrawal,
                setLoadingWithdrawal,
                setTokenBalance,
                setLoadingTokenBalance
              )
            : withdrawTx(
                secretjs,
                inputRef,
                ChainList[
                  currentToken.deposits[selectedChainIndex].source_chain_name
                ],
                addressIBC,
                secretAddress,
                currentToken,
                selectedChainIndex,
                loadingWithdrawal,
                setLoadingWithdrawal,
                setTokenBalance,
                setLoadingTokenBalance
              );
        }}
        text={"withdraw"}
        isLoading={loadingWithdrawal}
      />
    </div>
  );
};
