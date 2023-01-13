import {
  faArrowUpRightFromSquare,
  faMagnifyingGlass,
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
        <div className='max-w-2xl mx-auto px-6'>
          <h1 className='text-center font-bold text-4xl mb-10'>Bridge</h1>
          <p className='text-neutral-400'>
            Use the Axelar bridge down below to bridge your assets from Ethereum, Binance Smart chain (BSC), Arbitrum, Avalance, Moonbeam or Polygon to Secret.
            After bridging from Axelar, your bridged assets are all publicly visible. You will need to wrap them using the Secret Wrap.
          </p>
          <a
            href='https://satellite.money/?asset_denom=uusdc&source=ethereum&destination=secret'
            target='_blank'
            className='block my-2 p-3 w-full text-center font-semibold bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 focus:bg-cyan-600 transition-colors'
          >
            Axelar Bridge
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='ml-2' />
          </a>
          <p className='text-neutral-400'>
            Done with bridging into Secret ? Wrap your publicly visible assets with Secret Wrap into its privacy-preserving equivalent.
          </p>
          <Link
            to='/wrap'
            className='block my-2 p-3 w-full text-center font-semibold bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 focus:bg-cyan-600 transition-colors'
          >
            Secret Wrap
          </Link>
        </div>
      </>
    );
  }
}

export default Bridge;
