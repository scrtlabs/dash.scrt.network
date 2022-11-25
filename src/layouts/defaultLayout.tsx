import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Footer } from 'components/general/Footer';
import { KeplrPanel } from 'components/general/Keplr';
import { Navigation } from 'components/general/navigation';
import React, { useState, createContext} from 'react';
import { SecretNetworkClient } from 'secretjs';

export const KeplrContext = createContext(null);

export const DefaultLayout =({children}) =>{
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null >(null);
  const [secretAddress, setSecretAddress] = useState<string>("");
    return(
        <>

          <div className="flex ">
            <aside className="w-72 md:fixed left-0 top-0 h-screen bg-zinc-800 p-10 overflow-x-hidden hidden md:block">
              <Navigation />
            </aside>
            <KeplrContext.Provider value={ {secretjs, secretAddress} }>
              <main className="flex-1 md:ml-72">
                {/* Keplr */}
                <div className="flex items-center gap-4 m-4">
                  <div className="flex-initial md:hidden">
                    <button className="text-white hover:text-zinc-200 active:text-zinc-400 transition-colors">
                      <FontAwesomeIcon icon={faBars} size="lg" />
                    </button>
                  </div>
                  <div className="flex-1 md:flex md:justify-end">
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