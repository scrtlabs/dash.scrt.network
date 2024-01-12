import SkeletonLoader from './SkeletonLoader'

interface Props {
  amount?: number
}

/**
 * Render multiple SkeletonLoader components based on the specified amount.
 *
 * @param {number} [amount=20] - The number of SkeletonLoaders to render. Default is 20.
 *
 * @remarks
 * This function is intended for use in the /apps context.
 *
 * @example
 * ```tsx
 * <SkeletonLoaders amount={10} />
 * ```
 */
export default function SkeletonLoaders({ amount = 20 }: Props) {
  return (
    <>
      {Array.from({ length: amount }).map((_, index) => (
        <SkeletonLoader key={index} />
      ))}
    </>
  )
}
