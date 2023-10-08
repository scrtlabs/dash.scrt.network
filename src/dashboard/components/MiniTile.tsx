import React from 'react'
import { Else, If, Then } from 'react-if'

interface Props {
  name: string
  value?: string
}

const MiniTile = (props: Props) => {
  return (
    <>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl h-full flex items-center px-4 py-4">
        <div className="flex-1 text-center">
          <div className="text-neutral-500 dark:text-neutral-500 text-sm font-semibold mb-0.5">
            {props.name}
          </div>
          <div className="text-xl">
            <If condition={props.value}>
              <Then>{props.value}</Then>
              <Else>
                <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-20 h-7 mx-auto"></div>
              </Else>
            </If>
          </div>
        </div>
      </div>
    </>
  )
}

export default MiniTile
