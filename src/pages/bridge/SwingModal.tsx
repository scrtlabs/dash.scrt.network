import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Theme } from 'types/Theme'
import { Swap } from '@swing.xyz/ui'
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: any
  theme: Theme
  secretAddress: string
}

const SwingModal = (props: Props) => {
  if (!props.open) return null

  useEffect(() => {
    if (props.theme === 'light') {
      import('./SwingModal_Light.scss')
    } else {
      import('./SwingModal_Dark.scss')
    }
  }, [props.theme])
  return (
    <>
      {/* Outer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 dark:bg-black/80 z-50 flex items-center justify-center"
        //onClick={props.onClose}
      >
        {/* Inner */}
        <div className="relative onEnter_fadeInDown h-full overflow-scroll scrollbar-hide flex items-center justify-center">
          <div className="mx-auto px-4" style={{ minWidth: '500px' }}>
            <div
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 relative w-full"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {/* Close Button */}
              <button
                onClick={props.onClose}
                className="text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors px-1.5 py-2 rounded-lg text-xl absolute top-3 right-3 z-10"
              >
                <FontAwesomeIcon icon={faXmark} className="fa-fw" />
              </button>
              <Swap projectId="secret-network" environment="production" title="" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SwingModal
