interface IProps {
  blockHeight?: number
  blockTime?: number
  circulatingSupply?: number
  inflation?: number
}

export default function BlockInfo(props: IProps) {
  const formattedInflation = props.inflation ? props.inflation * 100 + '%' : null
  const formattedCirculatingSupply = props.circulatingSupply

  return (
    <>
      <div className="bg-neutral-800 p-8 rounded-lg">
        <div className="grid grid-cols-2 text-center">
          {/* Top Left */}
          <div className="col-span p-8 border-b border-r border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">Block Height</div>
            <div className="text-2xl">
              {props.blockHeight ? (
                <>{props.blockHeight}</>
              ) : (
                <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
              )}
            </div>
          </div>
          {/* Top Right */}
          <div className="col-span-1 p-8 border-b border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">Block Time</div>
            <div className="text-2xl">
              {props.blockTime ? (
                <>
                  {props.blockTime}s {/* 5.77 is a possible value... Needs to be formatted in seconds */}
                </>
              ) : (
                <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
              )}
            </div>
          </div>
          {/* Bottom Left */}
          <div className="col-span-1 p-8 border-r border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">Daily Transactions</div>
            {formattedCirculatingSupply ? (
              <>{formattedCirculatingSupply}</>
            ) : (
              <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
            )}
          </div>
          {/* Bottom Right */}
          <div className="col-span-1 p-8">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">???</div>
            <div className="text-2xl">
              {formattedInflation ? (
                <>{formattedInflation}</>
              ) : (
                <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-12 h-8 mx-auto"></div>
              )}
            </div>
          </div>
        </div>
        <div>Data provioded</div>
      </div>
    </>
  )
}
