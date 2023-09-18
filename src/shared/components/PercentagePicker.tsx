interface IPercentagePickerProps {
  setAmountByPercentage: (percentage: number) => void
  disabled: boolean
}

function PercentagePicker(props: IPercentagePickerProps) {
  return (
    <div className="inline-flex rounded-full text-xs font-semibold">
      <button
        onClick={() => props.setAmountByPercentage(25)}
        className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-l-md transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
        disabled={props.disabled}
      >
        25%
      </button>
      <button
        onClick={() => props.setAmountByPercentage(50)}
        className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
        disabled={props.disabled}
      >
        50%
      </button>
      <button
        onClick={() => props.setAmountByPercentage(75)}
        className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
        disabled={props.disabled}
      >
        75%
      </button>
      <button
        onClick={() => props.setAmountByPercentage(100)}
        className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-r-md border-l border-neutral-300 dark:border-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer disabled:text-neutral-500 dark:disabled:text-neutral-500 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-neutral-900 disabled:cursor-default focus:outline-0 focus:ring-2 ring-sky-500/40 focus:z-10"
        disabled={props.disabled}
      >
        MAX
      </button>
    </div>
  )
}

export default PercentagePicker
