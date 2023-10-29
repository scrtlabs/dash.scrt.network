import React from 'react'

type Type = 'button' | 'submit' | 'reset'
type Size = 'default' | 'large' | 'small'
type Color = 'primary' | 'secondary' | 'red' | 'blue' | 'emerald' | 'yellow'

const colorClasses: Record<Color, string> = {
  primary:
    'enabled:bg-sky-500 dark:enabled:bg-sky-600 enabled:hover:bg-sky-600 dark:enabled:hover:bg-sky-700 enabled:text-white disabled:bg-neutral-600 disabled:text-neutral-400 enabled:ring-sky-500/40 dark:enabled:ring-sky-600/40',
  secondary:
    'enabled:bg-gray-500 dark:enabled:bg-gray-600 enabled:hover:bg-gray-600 dark:enabled:hover:bg-gray-700 enabled:text-white disabled:bg-neutral-600 disabled:text-neutral-400 enabled:ring-gray-500/40 dark:enabled:ring-gray-600/40',
  red: 'enabled:bg-red-500 dark:enabled:bg-red-600 enabled:hover:bg-red-600 dark:enabled:hover:bg-red-700 enabled:text-white disabled:bg-neutral-600 disabled:text-neutral-400 enabled:ring-red-500/40 dark:enabled:ring-red-600/40',
  blue: 'enabled:bg-blue-500 dark:enabled:bg-blue-600 enabled:hover:bg-blue-600 dark:enabled:hover:bg-blue-700 enabled:text-white disabled:bg-neutral-600 disabled:text-neutral-400 enabled:ring-blue-500/40 dark:enabled:ring-blue-600/40',
  emerald:
    'enabled:bg-emerald-500 dark:enabled:bg-emerald-600 enabled:hover:bg-emerald-600 dark:enabled:hover:bg-emerald-700 enabled:text-white disabled:bg-neutral-600 disabled:text-neutral-400 enabled:ring-emerald-500/40 dark:enabled:ring-emerald-600/40',
  yellow:
    'enabled:bg-yellow-500 dark:enabled:bg-yellow-600 enabled:hover:bg-yellow-600 dark:enabled:hover:bg-yellow-700 enabled:text-black disabled:bg-neutral-600 disabled:text-neutral-400 enabled:ring-yellow-500/40 dark:enabled:ring-yellow-600/40'
}

const sizeClasses: Record<Size, string> = {
  default: 'py-2 px-4 text-sm',
  large: 'py-3 px-4 text-sm',
  small: 'py-2 px-4 text-sm'
}

interface Props {
  children?: React.ReactNode
  type?: Type
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  color?: Color
  size?: Size
  disabled?: boolean
}

export default function Button(props: Props) {
  return (
    <button
      disabled={props.disabled || false}
      className={`focus:outline-none focus-visible:ring-4 text-center font-bold rounded transition-colors
      ${colorClasses[props.color || 'primary']}
      ${sizeClasses[props.size || 'default']}
    `}
      type={props.type || 'button'}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
