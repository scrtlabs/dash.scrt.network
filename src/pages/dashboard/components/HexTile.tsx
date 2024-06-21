interface Item {
  key: string
  value: string
}

interface Props {
  item1?: Item
  item2?: Item
  item3?: Item
  item4?: Item
  item5?: Item
  item6?: Item
}

export default function HexTile(props: Props) {
  return (
    <>
      <div className="rounded-xl bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 p-8 h-full">
        <div className="flex flex-col h-full">
          <div className="flex-1 flex text-center items-center">
            {/* First Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-r border-b border-neutral-200 dark:border-neutral-700">
              <div className="py-4">
                <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item1?.key}
                </div>
                <div className="text-xl">
                  {props.item1?.value ? (
                    <>{props.item1.value}</>
                  ) : (
                    <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                  )}
                </div>
              </div>
            </div>
            {/* Second Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-r border-b border-neutral-200 dark:border-neutral-700">
              <div className="py-4">
                <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item2?.key}
                </div>
                <div className="text-xl">
                  {props.item2?.value ? (
                    <>{props.item2?.value}</>
                  ) : (
                    <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                  )}
                </div>
              </div>
            </div>
            {/* Third Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-b border-neutral-200 dark:border-neutral-700">
              <div className="py-4">
                <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item3?.key}
                </div>
                <div className="text-xl">
                  {props.item3?.value ? (
                    <>{props.item3?.value}</>
                  ) : (
                    <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex text-center items-center">
            {/* Fourth Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-r border-neutral-200 dark:border-neutral-700">
              <div className="py-4">
                <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item4?.key}
                </div>
                <div className="text-xl">
                  {props.item4?.value ? (
                    <>{props.item4?.value}</>
                  ) : (
                    <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                  )}
                </div>
              </div>
            </div>
            {/* Fifth Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-r border-neutral-200 dark:border-neutral-700">
              <div className="py-4">
                <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item5?.key}
                </div>
                <div className="text-xl">
                  {props.item5?.value ? (
                    <>{props.item5?.value}</>
                  ) : (
                    <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                  )}
                </div>
              </div>
            </div>
            {/* Sixth Item */}
            <div className="flex-1 h-full flex flex-col justify-center border-neutral-200 dark:border-neutral-700">
              <div className="py-4">
                <div className="text-neutral-400 dark:text-neutral-500 text-sm font-semibold mb-0.5">
                  {props.item6?.key}
                </div>
                <div className="text-xl">
                  {props.item6?.value ? (
                    <>{props.item6?.value}</>
                  ) : (
                    <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-16 h-7 mx-auto"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
