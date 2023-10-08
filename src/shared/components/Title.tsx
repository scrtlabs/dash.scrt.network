import React from 'react'

interface Props {
  title: String
  children?: React.ReactNode
}

const Title = (props: Props) => {
  return (
    <div className="text-center mb-4 max-w-6xl mx-auto">
      <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
        {props.title}
      </h1>
      {props.children}
    </div>
  )
}

export default Title
