import React, { useEffect, useRef, useState } from "react";
import { StyledTokenForm } from "./styled";
import { Tab, Tabs } from "../Tabs/Tabs";
import { UnwrappedToken, WrappedToken } from "./WrappedTokens/WrappedTokens";

import { Button } from "../Button/Button";
import { Indicators } from "./Indicators/Indicators";

import { TokenList } from "./TokenList/TokenList";
import { TokensList } from "../../config";
import { mergeStateType, TokensMarketData, Token } from "../../types";
import { rootIcons } from "../../assets/images";
import { SecretNetworkClient } from "secretjs";
import { setupKeplr } from "../Helpers/keplr";
import { getPrice, getMarketData } from "../Helpers/data";

import { DepositIBC } from "./DepositIBC/DepositIBC";
import { WithdrawIBC } from "./WithdrawIBC/WithdrawIBC";
import { wrap, unwrap } from "./WrappedTokens/wrapTx";

interface TokenFormProps {
  mergeState: mergeStateType;
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>;
  setSecretAddress: React.Dispatch<React.SetStateAction<string>>;
  currentToken: Token;
}

export function TokenForm({
  mergeState,
  secretjs,
  secretAddress,
  setSecretjs,
  setSecretAddress,
  currentToken,
}: TokenFormProps) {
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [marketData, setMarketData] = useState<TokensMarketData>({
    market_cap: 0,
    price_change_percentage_24h: 0,
  });

  const [isWrapToken, setIsWrapToken] = useState(true);
  const wrapTitle = isWrapToken ? "wrap" : "unwrap";
  const wrapInputRef = useRef<any>();

  const [loadingWrap, setLoadingWrap] = useState<boolean>(false);
  const [loadingUnwrap, setLoadingUnwrap] = useState<boolean>(false);

  const [loadingMarketData, setLoadingMarketData] = useState<boolean>(false);
  const [loadingTokenPrice, setLoadingTokenPrice] = useState<boolean>(false);

  const [errorBtnClass, setErrorBtnClass] = useState<string>("");

  const toggleWrappedTokens = () => setIsWrapToken((prev) => !prev);

  useEffect(() => {
    getPrice(currentToken, setTokenPrice, setLoadingTokenPrice);
    getMarketData(currentToken, setMarketData, setLoadingMarketData);
  }, [currentToken]);

  return (
    <StyledTokenForm>
      <Tabs
        currentTab={"wrap"}
        disableTabsOnchange={!secretAddress}
        setErrorBtnClass={setErrorBtnClass}
      >
        <Tab tabKey={"wrap"} title={wrapTitle}>
          <div className="wrapped-elems">
            {isWrapToken ? (
              <>
                <UnwrappedToken
                  currentToken={currentToken}
                  secretjs={secretjs}
                  secretAddress={secretAddress}
                  tokenPrice={tokenPrice}
                  loadingWrap={loadingWrap}
                  loadingUnwrap={loadingUnwrap}
                />
                <img
                  className="swap"
                  src={rootIcons.swap}
                  alt="swap"
                  onClick={toggleWrappedTokens}
                />
                <WrappedToken
                  currentToken={currentToken}
                  secretjs={secretjs}
                  secretAddress={secretAddress}
                  tokenPrice={tokenPrice}
                  loadingWrap={loadingWrap}
                  loadingUnwrap={loadingUnwrap}
                />
              </>
            ) : (
              <>
                <WrappedToken
                  currentToken={currentToken}
                  secretjs={secretjs}
                  secretAddress={secretAddress}
                  tokenPrice={tokenPrice}
                  loadingWrap={loadingWrap}
                  loadingUnwrap={loadingUnwrap}
                />
                <img
                  className="swap"
                  src={rootIcons.swap}
                  alt="swap"
                  onClick={toggleWrappedTokens}
                />
                <UnwrappedToken
                  currentToken={currentToken}
                  secretjs={secretjs}
                  secretAddress={secretAddress}
                  tokenPrice={tokenPrice}
                  loadingWrap={loadingWrap}
                  loadingUnwrap={loadingUnwrap}
                />
              </>
            )}
          </div>

          <div className="count">
            <input
              autoFocus
              placeholder={`Amount to ${isWrapToken ? "Wrap" : "Unwrap"}`}
              ref={wrapInputRef}
            />
            <img src={currentToken.image} alt="Current Token Logo" />
          </div>

          {secretjs ? (
            <Button
              text={wrapTitle}
              action={() => {
                isWrapToken
                  ? wrap({
                      secretjs,
                      secretAddress,
                      currentToken,
                      wrapInputRef,
                      loadingWrap,
                      loadingUnwrap,
                      setLoadingWrap,
                      setLoadingUnwrap,
                    })
                  : unwrap({
                      secretjs,
                      secretAddress,
                      currentToken,
                      wrapInputRef,
                      loadingWrap,
                      loadingUnwrap,
                      setLoadingWrap,
                      setLoadingUnwrap,
                    });
              }}
              isLoading={loadingWrap || loadingUnwrap}
            />
          ) : (
            <Button
              errorClass={errorBtnClass}
              text={"Connect wallet"}
              action={() => setupKeplr(setSecretjs, setSecretAddress)}
            />
          )}

          <Indicators
            marketCap={marketData.market_cap}
            tokenPrice={tokenPrice}
            priceChange={marketData.price_change_percentage_24h}
            loadingTokenPrice={loadingTokenPrice}
            loadingMarketData={loadingMarketData}
          />
        </Tab>

        <Tab tabKey={"bridge"} title={"bridge (ibc)"}>
          <div className="deposit-withdraw-tabs">
            <Tabs currentTab={"deposit"}>
              <Tab tabKey={"deposit"} title={"deposit"}>
                <DepositIBC
                  secretAddress={secretAddress}
                  currentToken={currentToken}
                />
              </Tab>
              <Tab tabKey={"withdraw"} title={"withdraw"}>
                <WithdrawIBC
                  currentToken={currentToken}
                  secretjs={secretjs}
                  secretAddress={secretAddress}
                />
              </Tab>
            </Tabs>
          </div>
        </Tab>
      </Tabs>

      <TokenList
        list={TokensList}
        activeTokenName={currentToken.name}
        setTokenOptions={mergeState}
      />
    </StyledTokenForm>
  );
}
