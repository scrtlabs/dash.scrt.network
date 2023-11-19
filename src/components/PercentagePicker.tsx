interface Props {
  setAmountByPercentage: (percentage: number) => void
  disabled?: boolean
}

export default function PercentagePicker(props: Props) {
  return (
    <div className="inline-flex rounded-full text-xs font-extrabold">
      <button
        type="button"
        onClick={() => props.setAmountByPercentage(25)}
        className="bg-gray-300 dark:bg-neutral-800 py-1.5 px-2.5 rounded-l-lg enabled:hover:bg-gray-400 enabled:dark:hover:bg-neutral-600 transition"
        disabled={props.disabled}
      >
        25%
      </button>
      <button
        type="button"
        onClick={() => props.setAmountByPercentage(50)}
        className="bg-gray-300 dark:bg-neutral-800 py-1.5 px-2.5 enabled:hover:bg-gray-400 enabled:dark:hover:bg-neutral-600 transition"
        disabled={props.disabled}
      >
        50%
      </button>
      <button
        type="button"
        onClick={() => props.setAmountByPercentage(75)}
        className="bg-gray-300 dark:bg-neutral-800 py-1.5 px-2.5 enabled:hover:bg-gray-400 enabled:dark:hover:bg-neutral-600 transition"
        disabled={props.disabled}
      >
        75%
      </button>
      <button
        type="button"
        onClick={() => props.setAmountByPercentage(100)}
        className="bg-gray-300 dark:bg-neutral-800 py-1.5 px-2.5 rounded-r-lg enabled:hover:bg-gray-400 enabled:dark:hover:bg-neutral-600 transition"
        disabled={props.disabled}
      >
        100%
      </button>
    </div>
  )
}
