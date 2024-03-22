import Badge from 'components/UI/Badge/Badge'

interface Props {
  name: string
}
const Tag = (props: Props) => {
  return (
    <>
      <Badge color="dark">{props.name}</Badge>
    </>
  )
}

export default Tag
