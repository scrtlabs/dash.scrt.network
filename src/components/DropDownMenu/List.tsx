import React, { FC, useEffect } from "react";
import { StyledList } from "./styled";
import { Chain, Token } from "../../types";
import { ChainList } from "../../config";

interface ListMenuItem {
  name: string;
  idx?: number;
  image?: string;
}

interface ListProps {
  list: ListMenuItem[];
  setSelectedChainIndex: React.Dispatch<React.SetStateAction<number>>;
  setTargetChain: React.Dispatch<React.SetStateAction<Chain>>;
  tab: string;
  currentToken: Token;
}

export const List: FC<ListProps> = ({
  list,
  setSelectedChainIndex,
  setTargetChain,
  tab,
  currentToken,
}) => {
  return (
    <StyledList>
      <div className="items-list">
        {list.map(({ name, image }, idx) => (
          <div
            key={name}
            className="item"
            onClick={() => {
              setSelectedChainIndex(idx);
              tab === "deposits"
                ? setTargetChain(
                    ChainList[currentToken.deposits[idx].source_chain_name]
                  )
                : setTargetChain(
                    ChainList[currentToken.withdrawals[idx].target_chain_name]
                  );
            }}
          >
            {image && <img src={image} alt="" />}
            <p className="title">{name}</p>
          </div>
        ))}
      </div>
    </StyledList>
  );
};
