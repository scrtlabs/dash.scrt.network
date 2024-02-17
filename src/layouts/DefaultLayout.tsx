import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Footer from 'components/Footer'
import { Navigation } from 'components/Navigation'
import { useState, createContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import FloatingCTAButton from 'components/FloatingCTAButton'
import { Nullable } from 'types/Nullable'
import Wallet from 'components/Wallet/Wallet'
import toast, { ToastBar, Toaster, ToasterProps } from 'react-hot-toast'
import FeedbackButton from 'components/FeedbackButton'
import Settings from 'components/Settings/Settings'

export const NavigationContext = createContext<Nullable<boolean>>(null)

export const DefaultLayout = ({ children }: any) => {
  /**
   * Mobile Menu Handler
   */
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)

  // auto close menu
  const location = useLocation()
  useEffect(() => {
    if (showMobileMenu) {
      setShowMobileMenu(false)
    }
  }, [location])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024 && setShowMobileMenu) {
        setShowMobileMenu(false)
      }
    }
    window.addEventListener('resize', handleResize)
  }, [])

  const toasterProps: ToasterProps = {
    position: 'bottom-left',
    reverseOrder: true,
    gutter: 8,
    toastOptions: {
      duration: Infinity,
      className: 'bg-white text-black dark:bg-neutral-800 dark:text-white'
    }
  }

  return (
    <>
      <Toaster {...toasterProps}>
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== 'loading' && <button onClick={() => toast.dismiss(t.id)}>X</button>}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
      {/* Feedback Button */}
      <FeedbackButton url={'https://github.com/scrtlabs/dash.scrt.network/issues/new'} />
      {/* Help Button */}
      <FloatingCTAButton url="https://linktr.ee/SCRTSupport" text="Need Help?" />
      <div className="flex">
        {/* Menu */}
        <aside
          className={
            (showMobileMenu
              ? 'z-50 left-0 right-0 w-full lg:w-auto min-h-screen bg-white dark:bg-neutral-900'
              : 'hidden lg:block') +
            ' ' +
            'lg:w-[17rem] fixed left-0 top-0 h-screen px-4 py-6 overflow-x-hidden'
          }
        >
          <NavigationContext.Provider value={showMobileMenu}>
            <Navigation showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />
          </NavigationContext.Provider>
        </aside>
        <main className="flex flex-col min-h-screen flex-1 lg:ml-[17rem]">
          {/* Info Box */}
          <div className="bg-indigo-500 dark:bg-indigo-600 px-4 py-1.5 text-sm text-center text-white">
            <b>
              {`Earn yield on your ETH assets while benefiting from private DeFi
              with Shade Protocol! `}

              <a
                href="https://scrt.network/evm-shade-metamask-defi"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Learn More ⚡️
              </a>
            </b>
          </div>

          <div className="flex-1">
            {/* Top Bar [Burger Menu | Socials | Keplr] */}
            <div className="flex items-center gap-4 p-4">
              {/* Burger Menu */}
              <div className="flex-initial lg:hidden">
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                >
                  <FontAwesomeIcon icon={faBars} size="xl" />
                </button>
              </div>

              <div className="flex-1 sm:flex-initial sm:flex sm:justify-end">
                <Wallet />
              </div>

              {/* Settings */}
              <div className="flex-initial">
                <Settings />
              </div>
            </div>

            <div className="lg:mr-[17rem]">{children}</div>
          </div>
          <div className="lg:mr-[17rem]">
            <div className="max-w-7xl mx-auto mt-auto">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default DefaultLayout
