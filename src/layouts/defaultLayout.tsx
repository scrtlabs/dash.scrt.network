import { KeplrPanel } from 'components/Keplr';
import { Navigation } from 'components/navigation';
import React, { useState } from 'react';
import { SecretNetworkClient } from 'secretjs';

const DefaultLayout =({children}) =>{
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");
    return(
        <>

          <div className="flex">
            <aside className="w-72 fixed left-0 top-0 h-screen bg-black p-10 overflow-x-hidden">
              <Navigation />
            </aside>
            <main className="flex-1 ml-72">
              {/* Keplr */}
              <div className="md:flex md:justify-end m-4">
                <KeplrPanel
                  secretjs={secretjs}
                  setSecretjs={setSecretjs}
                  secretAddress={secretAddress}
                  setSecretAddress={setSecretAddress}
                />
              </div>
              {/* Real Main */}
              {children}
            </main>
          </div>






        </>
    )
}

export default DefaultLayout;