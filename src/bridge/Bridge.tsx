import {
  faArrowUpRightFromSquare,
  faMagnifyingGlass,
  faShuffle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Component, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { websiteName } from "App";

class Bridge extends React.Component {
  render() {
    return (
      <>
        <Helmet>
          <title>{websiteName} | Bridge</title>
        </Helmet>
        <div className='max-w-2xl mx-auto px-6 text-neutral-400 leading-7 text-justify'>
          <h1 className='text-center font-bold text-4xl mb-10 text-white'>Bridge</h1>
          <p>
            Use the <a href="https://satellite.money/?asset_denom=uusdc&source=ethereum&destination=secret" target='_blank' className='pb-0.5 border-b border-neutral-600 hover:text-white hover:border-white transition-colors'>Axelar Bridge</a> to bridge your assets from Blockchains such as Ethereum, Binance Smart Chain (BSC), Arbitrum, Avalance, Moonbeam and Polygon to Secret Network!
          </p><br />
          <p>
            {/* Shh, keep in mind: After bridging your assets from Axelar Bridge, they will remain publicly visible. Wrap your assets into their privacy-preserving equivalent using <Link to={'/wrap'} className='pb-0.5 border-b border-neutral-600 hover:text-white hover:border-white transition-colors'><FontAwesomeIcon icon={faShuffle} size={'xs'} className='mr-2' />Secret Wrap</Link>! These wrapped assets require a viewing key and thus are not visible to the public by design! */}
            <span className="select-none"><span className='inline-block bg-green-800 text-white text-xs p-0.5 rounded-sm uppercase font-semibold'>Protip</span> – </span>After bridging your assets from Axelar Bridge, they will remain publicly visible. Wrap your assets into their privacy-preserving equivalent using <Link to={'/wrap'} className='pb-0.5 border-b border-neutral-600 hover:text-white hover:border-white transition-colors'><FontAwesomeIcon icon={faShuffle} size={'xs'} className='mr-2' />Secret Wrap</Link>! These wrapped assets require a viewing key and thus are not visible to the public by design!
          </p>
          <a
            href='https://satellite.money/?asset_denom=uusdc&source=ethereum&destination=secret'
            target='_blank'
            className='text-white block my-6 p-3 w-full text-center font-semibold bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 focus:bg-cyan-600 transition-colors'
          >
            Axelar Bridge
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='ml-2' />
          </a>
        </div>
      </>
    );
  }
}

export default Bridge;
