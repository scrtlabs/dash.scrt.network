interface Props {
  name: string
}
const Tag = (props: Props) => {
  return (
    <div className="bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold px-2 py-1 rounded-md inline-block transition-colors">
      {props.name}
    </div>
  )
}

export default Tag
