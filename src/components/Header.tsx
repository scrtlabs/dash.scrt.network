interface Props {
  title: string
  description?: string
}

const Header = (props: Props) => {
  return (
    <>
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
          {props.title}
        </h1>
      </div>
      {/* Description */}
      {props.description && (
        <p className="sm:max-w-lg mx-auto mb-6 text-center text-neutral-500 dark:text-neutral-500">
          {props.description}
        </p>
      )}
    </>
  )
}

export default Header
