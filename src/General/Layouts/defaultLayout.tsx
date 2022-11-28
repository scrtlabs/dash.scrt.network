import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Discord } from 'General/Components/Discord';
import { Footer } from 'General/Components/Footer';
import { KeplrPanel } from 'General/Components/Keplr';
import { Navigation } from 'General/Components/navigation';
import React, { useState, createContext, useEffect} from 'react';
import { SecretNetworkClient } from 'secretjs';

export const KeplrContext = createContext(null);
export const NavigationContext = createContext(null);

export const DefaultLayout =({children}) =>{

  /**
   * Mobile Menu Handler
   */

  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  useEffect(() => {
    function handleResize() {
      if(window.innerWidth >= 1024 && setShowMobileMenu) {
        setShowMobileMenu(false);
      }
    }

    window.addEventListener('resize', handleResize);
  });


  /**
   * SecretJS & secretAddress init
   */

  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null >(null);
  const [secretAddress, setSecretAddress] = useState<string>("");

  
  return(
    <>
      <Discord />

      <div className="flex">
        <aside className={(showMobileMenu ? 'z-50 left-0 right-0 w-full lg:w-auto min-h-screen ' : 'hidden lg:block') + ' ' + 'lg:w-72 fixed left-0 top-0 h-screen p-10 overflow-x-hidden bg-zinc-800'}>
          <NavigationContext.Provider value={ {showMobileMenu} }>
            <Navigation showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />
          </NavigationContext.Provider>
        </aside>
        <KeplrContext.Provider value={ {secretjs, secretAddress} }>
          <main className="flex-1 lg:ml-72">
            {/* Keplr */}
            <div className="flex items-center gap-4 m-4">
              <div className="flex-initial lg:hidden">
                <button onClick={() => setShowMobileMenu(true)} className="text-white hover:text-zinc-200 active:text-zinc-400 transition-colors">
                  <FontAwesomeIcon icon={faBars} size="lg" />
                </button>
              </div>
              <div className="flex-1 lg:flex lg:justify-end">
                <KeplrPanel
                  secretjs={secretjs}
                  setSecretjs={setSecretjs}
                  secretAddress={secretAddress}
                  setSecretAddress={setSecretAddress}
                />
              </div>
            </div>
            {children}
            <Footer />
          </main>
        </KeplrContext.Provider>
      </div>
    </>
  )
}

export default DefaultLayout;