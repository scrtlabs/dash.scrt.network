import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "shared/components/Footer";
import { KeplrPanel } from "shared/components/Keplr";
import { Navigation } from "shared/components/Navigation";
import React, { useState, createContext, useEffect } from "react";
import { SecretNetworkClient } from "secretjs";
import { Breakpoint } from "react-socks";
import { Flip, ToastContainer, toast } from "react-toastify";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { useLocation } from "react-router-dom";
import { FeeGrantStatus } from "shared/Utils/types";
import FloatingCTAButton from "shared/components/FloatingCTAButton";

export const KeplrContext = createContext<{
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
} | null>(null);
export const NavigationContext = createContext<boolean | null>(null);
export const FeeGrantContext = createContext(null);

export const DefaultLayout = ({ children }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Mobile Menu Handler
   */
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  // auto close menu
  const location = useLocation();
  useEffect(() => {
    if (showMobileMenu) {
      setShowMobileMenu(false);
    }
  }, [location]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024 && setShowMobileMenu) {
        setShowMobileMenu(false);
      }
    }
    window.addEventListener("resize", handleResize);
  });

  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");

  const [feeGrantStatus, setFeeGrantStatus] =
    useState<FeeGrantStatus>("Untouched");

  return (
    <>
      <FloatingCTAButton
        url='https://linktr.ee/SCRTSupport'
        text='Need Help?'
      />

      <div className='flex'>
        <aside
          className={
            (showMobileMenu
              ? "z-50 left-0 right-0 w-full lg:w-auto min-h-screen "
              : "hidden lg:block") +
            " " +
            "lg:w-72 fixed left-0 top-0 h-screen p-6 overflow-x-hidden bg-neutral-900 sm:border-r border-neutral-800"
          }
        >
          <NavigationContext.Provider value={showMobileMenu}>
            <Navigation
              showMobileMenu={showMobileMenu}
              setShowMobileMenu={setShowMobileMenu}
            />
          </NavigationContext.Provider>
        </aside>
        <KeplrContext.Provider value={{ secretjs, secretAddress }}>
          <FeeGrantContext.Provider
            value={{ feeGrantStatus, setFeeGrantStatus }}
          >
            <main className='flex flex-col min-h-screen flex-1 lg:ml-72'>
              {/* Top Bar [Burger Menu | Socials | Keplr] */}
              <div className='flex items-center gap-4 p-4'>
                {/* Burger Menu */}
                <div className='flex-initial lg:hidden'>
                  <button
                    onClick={() => setShowMobileMenu(true)}
                    className='text-white hover:text-neutral-200 active:text-neutral-400 transition-colors'
                  >
                    <FontAwesomeIcon icon={faBars} size='xl' />
                  </button>
                </div>

                <div className='flex-initial sm:flex-1 text-right space-x-2'>
                  <a
                    href='https://twitter.com/SecretNetwork'
                    target='_blank'
                    className='text-neutral-200 hover:text-white transition-colors'
                  >
                    <FontAwesomeIcon icon={faTwitter} size='lg' />
                  </a>
                  <a
                    href='https://discord.com/invite/SJK32GY'
                    target='_blank'
                    className='text-neutral-200 hover:text-white transition-colors'
                  >
                    <FontAwesomeIcon icon={faDiscord} size='lg' />
                  </a>
                </div>

                <div className='flex-1 sm:flex-initial sm:flex sm:justify-end'>
                  <KeplrPanel
                    secretjs={secretjs}
                    setSecretjs={setSecretjs}
                    secretAddress={secretAddress}
                    setSecretAddress={setSecretAddress}
                  />
                </div>
              </div>

              {children}
              <div className='max-w-7xl mx-auto mt-auto'>
                <Footer />
              </div>
            </main>
          </FeeGrantContext.Provider>
        </KeplrContext.Provider>
      </div>
      <Breakpoint medium up>
        <ToastContainer
          position='bottom-left'
          autoClose={5000}
          hideProgressBar
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover={true}
          theme='dark'
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
};

export default DefaultLayout;