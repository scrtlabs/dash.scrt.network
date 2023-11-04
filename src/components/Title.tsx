import React, { ReactNode } from 'react'

interface IProps {
  title: String
  children?: ReactNode
  className?: string
}

export default function Title(props: IProps) {
  return (
    <div className={`text-center mb-4 max-w-6xl mx-auto ${props.className || ''}`}>
      <h1 className="font-bold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
        {props.title}
      </h1>
      {props.children}
    </div>
  )
}
