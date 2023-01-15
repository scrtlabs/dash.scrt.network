import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Else, If, Then } from "react-if";

interface IWideQuadTileProps {
  item1_key?: string;
  item1_value?: string;
  item2_key?: string;
  item2_value?: string;
  item3_key?: string;
  item3_value?: string;
  item4_key?: string;
  item4_value?: string;
}

const WideQuadTile = (props: IWideQuadTileProps) => {
  return (
    <>
      <div className='bg-neutral-800 p-8 md:p-2 rounded-xl h-full'>
        <div className='flex flex-col md:flex-row'>
          {/* First Row */}
          <div className='flex-1 flex text-center items-center'>
            {/* First Item */}
            <div className='flex-1 h-full flex flex-col justify-center border-r border-b md:border-b-0 border-neutral-700'>
              <div className='py-4'>
                <div className='text-neutral-500 text-sm font-semibold mb-0.5'>
                  Current Price
                </div>
                <div className='text-2xl'>$0.63</div>
                <div className='mx-8 mt-4'>
                  <a
                    href='https://scrt.network/about/get-scrt#buy-scrt'
                    target='_blank'
                    className='w-full md:w-auto md:px-4 inline-block bg-cyan-500/20 text-cyan-200 hover:text-cyan-300 hover:bg-cyan-500/50 text-center transition-colors py-2.5 rounded-xl font-semibold text-sm'
                  >
                    Get SCRT
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      className='text-xs ml-2'
                    />
                  </a>
                </div>
              </div>
            </div>
            {/* Second Item */}
            <div className='flex-1 h-full flex flex-col justify-center md:border-r border-b md:border-b-0 border-neutral-700'>
              <div className='py-4'>
                <div className='text-neutral-500 text-sm font-semibold mb-0.5'>
                  Volume
                </div>
                <div className='text-2xl'>123456</div>
              </div>
            </div>
          </div>
          {/* Second Row */}
          <div className='flex-1 flex text-center items-center'>
            {/* First Item */}
            <div className='flex-1 h-full flex flex-col justify-center border-r border-neutral-700'>
              <div className='py-4'>
                <div className='text-neutral-500 text-sm font-semibold mb-0.5'>
                  Lorem Ipsum 3
                </div>
                <div className='text-2xl'>123456</div>
              </div>
            </div>
            {/* Second Item */}
            <div className='flex-1 h-full flex flex-col justify-center'>
              <div className='py-4'>
                <div className='text-neutral-500 text-sm font-semibold mb-0.5'>
                  Lorem Ipsum 4
                </div>
                <div className='text-2xl'>123456</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WideQuadTile;
