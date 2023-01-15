import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Else, If, Then } from "react-if";

interface ICurrentPriceProps {
  price?: number;
}

class CurrentPrice extends React.Component<ICurrentPriceProps> {
  render() {
    return (
      <div className='bg-neutral-800 rounded-xl h-full flex items-center px-8 py-4'>
        <div className='flex-1'>
          <div className='text-center inline-block'>
            <div className='text-neutral-500 text-sm font-semibold mb-0.5'>
              Current Price
            </div>
            <div className='text-2xl'>
              <If condition={this.props.price}>
                <Then>
                  {this.props.price?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Then>
                <Else>
                  <div className='animate-pulse'>
                    <div className='bg-neutral-700/40 rounded col-span-2 w-20 h-8 mx-auto'></div>
                  </div>
                </Else>
              </If>
            </div>
          </div>
        </div>
        <div className='flex-1 text-right'>
          <a
            href='https://scrt.network/about/get-scrt#buy-scrt'
            target='_blank'
            className='w-full md:w-auto md:px-4 inline-block bg-cyan-500/20 text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/50 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm'
          >
            Get SCRT
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              className='text-xs ml-2'
            />
          </a>
        </div>
      </div>
    );
  }
}

export default CurrentPrice;