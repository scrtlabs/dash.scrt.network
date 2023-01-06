import React from "react";
import { Else, If, Then } from "react-if";

interface IQuadTileProps {
  item1_key?: string,
  item1_value?: string,
  item2_key?: string,
  item2_value?: string,
  item3_key?: string,
  item3_value?: string,
  item4_key?: string,
  item4_value?: string
}

const QuadTile = (props: IQuadTileProps) => {

  return (
    <>
      <div className="bg-neutral-800 p-8 rounded-xl h-full">
        <div className="flex flex-col flex-1 h-full">
          {/* First Row */}
          <div className="flex-1 flex text-center items-center">
            {/* First Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-r border-b border-neutral-700">
              {/* Begin Inner */}
              <div className="py-4">
                <div className="text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item1_key}
                </div>
                <div className="text-2xl">
                  <If condition={props.item1_value}>
                    <Then>
                      {props.item1_value}
                    </Then>
                    <Else>
                      <div className="animate-pulse">
                        <div className="bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                      </div>
                    </Else>
                  </If>
                </div>
              </div>
              {/* End Inner */}
            </div>
            {/* Second Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-b border-neutral-700">
              {/* Begin Inner */}
              <div className="py-4">
                <div className="text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item1_key}
                </div>
                <div className="text-2xl">
                  <If condition={props.item1_value}>
                    <Then>
                      {props.item1_value}
                    </Then>
                    <Else>
                      <div className="animate-pulse">
                        <div className="bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                      </div>
                    </Else>
                  </If>
                </div>
              </div>
              {/* End Inner */}
            </div>
          </div>
          {/* Second Row */}
          <div className="flex-1 flex text-center items-center">
            {/* First Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-r border-neutral-700">
              {/* Begin Inner */}
              <div className="py-4">
                <div className="text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item1_key}
                </div>
                <div className="text-2xl">
                  <If condition={props.item1_value}>
                    <Then>
                      {props.item1_value}
                    </Then>
                    <Else>
                      <div className="animate-pulse">
                        <div className="bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                      </div>
                    </Else>
                  </If>
                </div>
              </div>
              {/* End Inner */}
            </div>
            {/* Second Item */}
            <div className="flex-1 h-full flex flex-col justify-center">
              {/* Begin Inner */}
              <div className="py-4">
                <div className="text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item1_key}
                </div>
                <div className="text-2xl">
                  <If condition={props.item1_value}>
                    <Then>
                      {props.item1_value}
                    </Then>
                    <Else>
                      <div className="animate-pulse">
                        <div className="bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                      </div>
                    </Else>
                  </If>
                </div>
              </div>
              {/* End Inner */}
            </div>
          </div>
          {/* Top Left */}
          {/* <div className="col-span p-8 border-b border-r border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">{props.item1_key}</div>
            <div className="text-2xl">
              <If condition={props.item1_value}>
                <Then>
                  {props.item1_value}
                </Then>
                <Else>
                  <div className="animate-pulse">
                    <div className="bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                  </div>
                </Else>
              </If>
            </div>
          </div> */}
          {/* Top Right */}
          {/* <div className="col-span-1 p-8 border-b border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">{props.item2_key}</div>
            <div className="text-2xl">
              <If condition={props.item2_value}>
                <Then>
                  {props.item2_value}
                </Then>
                <Else>
                  <div className="animate-pulse">
                    <div className="bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                  </div>
                </Else>
              </If>
            </div>
          </div> */}
          {/* Bottom Left */}
          {/* <div className="col-span-1 p-8 border-r border-neutral-700">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">{props.item3_key}</div>
              <div className="text-2xl">
                <If condition={props.item3_value}>
                  <Then>
                    {props.item3_value}
                  </Then>
                  <Else>
                    <div className="animate-pulse">
                      <div className="bg-neutral-700/40 rounded col-span-2 w-16 h-8 mx-auto"></div>
                    </div>
                  </Else>
                </If>
              </div>
            </div> */}
          {/* Bottom Right */}
          {/* <div className="col-span-1 p-8">
            <div className="text-neutral-500 text-sm font-semibold mb-0.5">{props.item4_key}</div>
            <div className="text-2xl">
              <If condition={props.item4_value}>
                <Then>
                  {props.item4_value}
                </Then>
                <Else>
                  <div className="animate-pulse">
                    <div className="bg-neutral-700/40 rounded col-span-2 w-12 h-8 mx-auto"></div>
                  </div>
                </Else>
              </If>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default QuadTile;