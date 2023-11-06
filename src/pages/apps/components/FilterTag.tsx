interface Props {
  name: string
  toggleTagFilter: any
  isTagInFilterList: (name: string) => string
}

const FilterTag = (props: Props) => {
  return (
    <button
      onClick={() => props.toggleTagFilter(props.name)}
      className={
        'inline-block text-sm px-1.5 py-0.5 rounded-md overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:focus-visible:ring-cyan-500' +
        (props.isTagInFilterList(props.name)
          ? '  text-white dark:text-white font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500'
          : ' bg-white dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 font-medium')
      }
    >
      {props.name}
    </button>
  )
}

export default FilterTag
