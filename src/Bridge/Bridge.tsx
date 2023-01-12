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
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi,
            libero! Ipsum similique a laudantium repellat amet modi harum quos!
            Reiciendis dolore doloribus aspernatur odit ratione vero corrupti
            deserunt modi tempore.
          </p>
          <Link
            to='/wrap'
            className='block my-2 p-3 w-full text-center font-semibold bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 focus:bg-cyan-600 transition-colors'
          >
            Secret Wrap
          </Link>
          <a
            href='https://satellite.money/?asset_denom=uusdc&source=ethereum&destination=secret'
            target='_blank'
            className='block my-2 p-3 w-full text-center font-semibold bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 focus:bg-cyan-600 transition-colors'
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
