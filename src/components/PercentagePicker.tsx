interface Props {
  setAmountByPercentage: (percentage: number) => void
  disabled?: boolean
}

export default function PercentagePicker(props: Props) {
  return (
    <div className="inline-flex rounded-full text-xs font-extrabold">
      <button
        onClick={() => props.setAmountByPercentage(25)}
        className="bg-neutral-300 dark:bg-neutral-800 py-1.5 px-2.5 rounded-l-lg hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
        disabled={props.disabled ? props.disabled : false}
      >
        25%
      </button>
      <button
        onClick={() => props.setAmountByPercentage(50)}
        className="bg-neutral-300 dark:bg-neutral-800 py-1.5 px-2.5 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
        disabled={props.disabled ? props.disabled : false}
      >
        50%
      </button>
      <button
        onClick={() => props.setAmountByPercentage(75)}
        className="bg-neutral-300 dark:bg-neutral-800 py-1.5 px-2.5 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
        disabled={props.disabled ? props.disabled : false}
      >
        75%
      </button>
      <button
        onClick={() => props.setAmountByPercentage(100)}
        className="bg-neutral-300 dark:bg-neutral-800 py-1.5 px-2.5 rounded-r-lg hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
        disabled={props.disabled ? props.disabled : false}
      >
        MAX
      </button>
    </div>
  )
}
