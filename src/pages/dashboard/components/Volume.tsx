interface IProps {
  volume?: string
}

export default function Volume(props: IProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl h-full flex items-center px-8 py-4">
      <div className="flex-1 text-center">
        <div className="text-neutral-500 dark:text-neutral-500 text-sm font-semibold mb-0.5">Volume</div>
        <div className="text-2xl">
          {props.volume ? (
            <>{props.volume}</>
          ) : (
            <div className="animate-pulse bg-neutral-300/40 dark:bg-neutral-700/40 rounded col-span-2 w-32 h-8 mx-auto"></div>
          )}
        </div>
      </div>
    </div>
  )
}
