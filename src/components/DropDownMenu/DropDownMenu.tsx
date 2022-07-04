import React, { useState, useEffect } from "react";
import { StyledDropDownMenu } from "./styled";
import { List } from "./List";
import { Token, Chain } from "../../types";
import { ChainList } from "../../config";

interface DropDownMenuProps {
  currentToken: Token;
  selectedChainIndex: number;
  setSelectedChainIndex: React.Dispatch<React.SetStateAction<number>>;
  setTargetChain: React.Dispatch<React.SetStateAction<Chain>>;
  tab: string;
}

export const DropDownMenu = ({
  currentToken,
  selectedChainIndex,
  setSelectedChainIndex,
  setTargetChain,
  tab,
}: DropDownMenuProps) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const list =
    tab === "deposits"
      ? currentToken.deposits.map((chain) => {
          return {
            name: ChainList[chain.source_chain_name].chain_name,
            image: ChainList[chain.source_chain_name].chain_image,
          };
        })
      : currentToken.withdrawals.map((chain) => {
          return {
            name: ChainList[chain.target_chain_name].chain_name,
            image: ChainList[chain.target_chain_name].chain_image,
          };
        });

  const toggleMenu = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen((prev) => !prev);
  };

  return (
    <StyledDropDownMenu menuOpen={menuOpen} onClick={toggleMenu}>
      <div className="items-block">
        <div className="active-item">
          {list[selectedChainIndex].image && (
            <img src={list[selectedChainIndex].image} alt="" />
          )}
          <p className="active-item-name">
            {list[selectedChainIndex].name && list[selectedChainIndex].name}
          </p>
          <Arrow />
        </div>
        {menuOpen && (
          <List
            list={list}
            setSelectedChainIndex={setSelectedChainIndex}
            setTargetChain={setTargetChain}
            tab={tab}
            currentToken={currentToken}
          />
        )}
      </div>
    </StyledDropDownMenu>
  );
};

const Arrow = () => {
  return (
    <svg
      className="arrow-icon"
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 11.5L8 6.5L3 11.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
