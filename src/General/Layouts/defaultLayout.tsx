import { faBars, faCheck, faCopy, faRotateRight, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Discord } from 'General/Components/Discord';
import { Footer } from 'General/Components/Footer';
import { KeplrPanel } from 'General/Components/Keplr';
import { Navigation } from 'General/Components/Navigation';
import React, { useState, createContext, useEffect, Component} from 'react';
import { SecretNetworkClient } from 'secretjs';
import { Breakpoint } from "react-socks";
import { Flip, ToastContainer, toast} from "react-toastify";
import { faucetURL } from "General/Utils/commons";
import { Else, If, Then } from 'react-if';
import Tooltip from '@mui/material/Tooltip';

export const KeplrContext = createContext<{ secretjs: SecretNetworkClient | null ; secretAddress: string }| null >(null);
export const NavigationContext = createContext<boolean | null>(null);
export const FeeGrantContext = createContext(null);

export const DefaultLayout =({children}:any) =>{

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

  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null >(null);
  const [secretAddress, setSecretAddress] = useState<string>("");


// Fee Grant
  const [isFeeGranted, setIsFeeGranted] = useState<boolean>(false);


  return (
    <>
      {/* <Discord /> */}

      <div className="flex">
        <aside
          className={
            (showMobileMenu
              ? "z-50 left-0 right-0 w-full lg:w-auto min-h-screen "
              : "hidden lg:block") +
            " " +
            "lg:w-72 fixed left-0 top-0 h-screen p-6 overflow-x-hidden bg-neutral-900"
          }
        >
          <NavigationContext.Provider value={{ showMobileMenu }}>
            <Navigation
              showMobileMenu={showMobileMenu!}
              setShowMobileMenu={setShowMobileMenu!}
            />
          </NavigationContext.Provider>
        </aside>
        <KeplrContext.Provider value={{ secretjs, secretAddress }}>
          <FeeGrantContext.Provider value={{ useFeegrant: isFeeGranted, setUseFeegrant: setIsFeeGranted }}>
              <main className="flex-1 lg:ml-72">
                {/* Keplr */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-initial lg:hidden">
                    <button
                      onClick={() => setShowMobileMenu(true)}
                      className="text-white hover:text-neutral-200 active:text-neutral-400 transition-colors"
                    >
                      <FontAwesomeIcon icon={faBars} size="lg" />
                    </button>
                  </div>

                  <div className="flex-1 sm:flex sm:justify-end">
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
          </FeeGrantContext.Provider>
        </KeplrContext.Provider>
      </div>
      <Breakpoint medium up>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover={true}
          theme="dark"
        />
      </Breakpoint>
      <Breakpoint small down>
        <ToastContainer
          position={"bottom-left"}
          autoClose={false}
          hideProgressBar={true}
          closeOnClick={true}
          draggable={false}
          theme={"dark"}
          transition={Flip}
        />
      </Breakpoint>
    </>
  );
}

export default DefaultLayout;