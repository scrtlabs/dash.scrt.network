import React from "react";

interface IBlockInfoProps {
  blockHeight: number,
  blockTime: number,
  transactions: number,
  inflation: number
}

const BlockInfo = (props: IBlockInfoProps) => {
  return (
    <>
      <div className="bg-neutral-800 p-8 rounded-lg">
        <div className="grid grid-cols-2 text-center">
          {/* Top Left */}
          <div className="col-span p-8 border-b border-r border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">Block Height</div>
            <div className="text-2xl">{props.blockHeight}</div>
          </div>
          {/* Top Right */}
          <div className="col-span-1 p-8 border-b border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">Block Time</div>
            <div className="text-2xl">{props.blockTime}</div>
          </div>
          {/* Bottom Left */}
          <div className="col-span-1 p-8 border-r border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">Transactions</div>
            <div className="text-2xl">{props.transactions}</div>
          </div>
          {/* Bottom Right */}
          <div className="col-span-1 p-8">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">Inflation</div>
            <div className="text-2xl">{props.inflation}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BlockInfo;