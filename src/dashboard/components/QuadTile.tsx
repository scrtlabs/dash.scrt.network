import { faSnowflake } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Else, If, Then } from "react-if";

interface IQuadTileProps {
  item1_key?: string;
  item1_value?: string;
  item2_key?: string;
  item2_value?: string;
  item3_key?: string;
  item3_value?: string;
  item4_key?: string;
  item4_value?: string;
}

class QuadTile extends React.Component<IQuadTileProps> {
  render() {
    return (
      <>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-xl h-full">
          <div className="flex flex-col h-full">
            <div className="flex-1 flex text-center items-center">
              {/* First Item */}
              <div className="flex-1 h-full flex flex-col justify-center border-r border-b border-neutral-200 dark:border-neutral-700">
                <div className="py-4">
                  <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                    {this.props.item1_key}
                  </div>
                  <div className="text-xl">
                    <If condition={this.props.item1_value}>
                      <Then>{this.props.item1_value}</Then>
                      <Else>
                        <div className="animate-pulse">
                          <div className="bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                        </div>
                      </Else>
                    </If>
                  </div>
                </div>
              </div>
              {/* Second Item */}
              <div className="flex-1 h-full flex flex-col justify-center border-b border-neutral-200 dark:border-neutral-700">
                <div className="py-4">
                  <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                    {this.props.item2_key}
                  </div>
                  <div className="text-xl">
                    <If condition={this.props.item2_value}>
                      <Then>{this.props.item2_value}</Then>
                      <Else>
                        <div className="animate-pulse">
                          <div className="bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                        </div>
                      </Else>
                    </If>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex text-center items-center">
              {/* Third Item */}
              <div className="flex-1 h-full flex flex-col justify-center border-r border-neutral-200 dark:border-neutral-700">
                <div className="py-4">
                  <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                    {this.props.item3_key}
                  </div>
                  <div className="text-xl">
                    <If condition={this.props.item3_value}>
                      <Then>{this.props.item3_value}</Then>
                      <Else>
                        <div className="animate-pulse">
                          <div className="bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                        </div>
                      </Else>
                    </If>
                  </div>
                </div>
              </div>
              {/* Fourth Item */}
              <div className="flex-1 h-full flex flex-col justify-center">
                <div className="py-4">
                  <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                    {this.props.item4_key}
                  </div>
                  <div className="text-xl">
                    <If condition={this.props.item4_value}>
                      <Then>{this.props.item4_value}</Then>
                      <Else>
                        <div className="animate-pulse">
                          <div className="bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                        </div>
                      </Else>
                    </If>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-neutral-500 dark:text-neutral-500 text-xs -mb-4 mt-4 text-center">
              Data provided by{" "}
              <a href="https://blizzard.finance/" target="_blank">
                Blizzard.finance
                <FontAwesomeIcon icon={faSnowflake} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default QuadTile;
