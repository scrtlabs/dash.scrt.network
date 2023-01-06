import React from "react";
import { Else, If, Then } from "react-if";

interface IMarketCapProps {
  marketCap?: string
}

const MarketCap = (props: IMarketCapProps) => {
  return (
    <>
      <div className="bg-neutral-800 rounded-xl h-full flex items-center px-8 py-4">
        <div className="flex-1 text-center">
          <div className="text-neutral-500 text-sm font-semibold mb-0.5">
            Market Cap
          </div>
          <div className="text-2xl">
            <If condition={props.marketCap}>
              <Then>
                {props.marketCap}
              </Then>
              <Else>
                <div className="animate-pulse">
                  <div className="bg-neutral-700/40 rounded col-span-2 w-32 h-8 mx-auto"></div>
                </div>
              </Else>
            </If>
          </div>
        </div>
      </div>
    </>
  );
}

export default MarketCap;