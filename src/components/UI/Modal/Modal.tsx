import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useClickOutside from 'hooks/useClickOutside'
import { ReactNode, useEffect, useRef } from 'react'

export type ModalSize = '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'

interface Props {
  size?: ModalSize
  title?: ReactNode
  subTitle?: ReactNode
  onClose: any
  isOpen: boolean
  children?: ReactNode
}

function Modal({ size = 'sm', ...props }: Props) {
  const sizeClass = () => {
    switch (size) {
      case '2xl':
        return 'max-w-screen-2xl'
      case 'xl':
        return 'max-w-screen-xl'
      case 'lg':
        return 'max-w-screen-lg'
      case 'md':
        return 'max-w-screen-md'
      case 'sm':
        return 'max-w-screen-sm'
      case 'xs':
        return 'max-w-[28rem]'
      default:
        return 'max-w-screen-sm'
    }
  }

  // toggles body scrollability
  useEffect(() => {
    const body: HTMLElement = document.body
    const bodyHasClass: boolean = body.classList.contains('overflow-hidden')
    if (props.isOpen && !bodyHasClass) {
      body.classList.add('overflow-hidden')
    } else if (!props.isOpen && bodyHasClass) {
      body.classList.remove('overflow-hidden')
    }
  }, [props.isOpen])

  const modalRef = useRef(null)
  useClickOutside(modalRef, () => props.onClose())

  if (!props.isOpen) {
    return null
  }

  return (
    <>
      {/* Outer */}
      <div className="z-50 fixed inset-0 bg-black/80 dark:text-white">
        <div className="absolute inset-0 overflow-y-scroll">
          <div className={`mt-4 md:mt-24 mb-24 ${sizeClass()} mx-auto`}>
            {/* Inner */}
            <div ref={modalRef} className="mx-4 bg-white dark:bg-neutral-900 p-8 rounded-2xl">
              {/* Head */}
              <div className={`flex mb-6 ${props.title || props.subTitle ? 'items-center gap-4' : 'justify-end'}`}>
                {/* Title and Subtitle */}
                {(props.title || props.subTitle) && (
                  <div className="flex-1 flex-col">
                    {props.title && <div className="text-xl font-semibold">{props.title}</div>}
                    {props.subTitle && (
                      <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-500 font-semibold">
                        {props.subTitle}
                      </div>
                    )}
                  </div>
                )}
                {/* Close Button */}
                <button
                  type="button"
                  onClick={props.onClose}
                  className="dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors py-2 px-2.5 rounded-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>

              {/* Body */}
              <div>{props.children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Modal
