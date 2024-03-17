type Color = 'primary' | 'dark' | 'red' | 'green' | 'yellow' | 'indigo' | 'purple' | 'pink'

type Size = 'default' | 'large'

type Props = {
  color?: Color
  size?: Size
  bordered?: boolean
  pill?: boolean
  children: React.ReactNode
}

const colorClasses: Record<Color, string> = {
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  dark: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
}

const borderClasses: Record<Color, string> = {
  primary: 'border border-blue-400 dark:bg-gray-700 dark:text-blue-400',
  dark: 'border border-dark-500 dark:bg-gray-700 dark:text-gray-400',
  red: 'border border-red-400 dark:bg-gray-700 dark:text-red-400',
  green: 'border border-green-400 dark:bg-gray-700 dark:text-green-400',
  yellow: 'border border-yellow-300 dark:bg-gray-700 dark:text-yellow-300',
  indigo: 'border border-indigo-400 dark:bg-gray-700 dark:text-indigo-400',
  purple: 'border border-purple-400 dark:bg-gray-700 dark:text-purple-400',
  pink: 'border border-pink-400 dark:bg-gray-700 dark:text-pink-400'
}

const sizeClasses: Record<Size, string> = {
  default: 'text-xs',
  large: 'text-sm'
}

function Badge(props: Props) {
  return (
    <span
      className={[
        colorClasses[props.color || 'primary'],
        sizeClasses[props.size || 'default'],
        props.bordered && borderClasses[props.color || 'primary'],
        props.pill ? 'rounded-full' : 'rounded',
        'inline-block font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300'
      ].join(' ')}
    >
      {props.children}
    </span>
  )
}

export default Badge
