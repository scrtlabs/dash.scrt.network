import Title from './Title'

interface Props {
  title: string
  description?: string
}

const Header = (props: Props) => {
  return (
    <>
      {/* Title */}
      <Title title={props.title} />
      {/* Description */}
      {props.description && (
        <p className="mt-4 sm:max-w-lg mx-auto mb-6 text-center text-neutral-500 dark:text-neutral-500">
          {props.description}
        </p>
      )}
    </>
  )
}

export default Header
