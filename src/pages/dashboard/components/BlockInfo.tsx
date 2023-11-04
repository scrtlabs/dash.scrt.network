import { Else, If, Then } from 'react-if'

interface Props {
  blockHeight: number
  blockTime: number
  circulatingSupply: number
  inflation: number
}

const BlockInfo = (props: Props) => {
  const formattedInflation = props.inflation
    ? props.inflation * 100 + '%'
    : null
  const formattedCirculatingSupply = props.circulatingSupply

  return (
    <>
      <div className="bg-neutral-800 p-8 rounded-lg">
        <div className="grid grid-cols-2 text-center">
          {/* Top Left */}
          <div className="col-span p-8 border-b border-r border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">
              Block Height
            </div>
            <div className="text-2xl">
              <If condition={props.blockHeight}>
                <Then>{props.blockHeight}</Then>
                <Else>
                  <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                </Else>
              </If>
            </div>
          </div>
          {/* Top Right */}
          <div className="col-span-1 p-8 border-b border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">
              Block Time
            </div>
            <div className="text-2xl">
              <If condition={props.blockTime}>
                <Then>
                  {props.blockTime}s{' '}
                  {/* 5.77 is a possible value... Needs to be formatted in seconds */}
                </Then>
                <Else>
                  <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                </Else>
              </If>
            </div>
          </div>
          {/* Bottom Left */}
          <div className="col-span-1 p-8 border-r border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">
              Daily Transactions
            </div>
            <If condition={formattedCirculatingSupply}>
              <Then>{formattedCirculatingSupply}</Then>
              <Else>
                <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
              </Else>
            </If>
          </div>
          {/* Bottom Right */}
          <div className="col-span-1 p-8">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">
              ???
            </div>
            <div className="text-2xl">
              <If condition={formattedInflation}>
                <Then>{formattedInflation}</Then>
                <Else>
                  <div className="animate-pulse bg-neutral-700/40 rounded col-span-2 w-12 h-8 mx-auto"></div>
                </Else>
              </If>
            </div>
          </div>
        </div>
        <div>Data provioded</div>
      </div>
    </>
  )
}

export default BlockInfo
