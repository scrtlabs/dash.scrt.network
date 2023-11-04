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
        className="bg-neutral-300 dark:bg-neutral-800 py-1.5 px-2.5 rounded-l-lg hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
        disabled={props.disabled}
      >
        25%
      </button>
      <button
        type="button"
        onClick={() => props.setAmountByPercentage(50)}
        className="bg-neutral-300 dark:bg-neutral-800 py-1.5 px-2.5 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
        disabled={props.disabled}
      >
        50%
      </button>
      <button
        type="button"
        onClick={() => props.setAmountByPercentage(75)}
        className="bg-neutral-300 dark:bg-neutral-800 py-1.5 px-2.5 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
        disabled={props.disabled}
      >
        75%
      </button>
      <button
        type="button"
        onClick={() => props.setAmountByPercentage(100)}
        className="bg-neutral-300 dark:bg-neutral-800 py-1.5 px-2.5 rounded-r-lg hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
        disabled={props.disabled}
      >
        100%
      </button>
    </div>
  )
}
