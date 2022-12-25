import { faBars, faCheck, faRotateRight, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Discord } from 'General/Components/Discord';
import { Footer } from 'General/Components/Footer';
import { KeplrPanel } from 'General/Components/Keplr';
import { Navigation } from 'General/Components/navigation';
import React, { useState, createContext, useEffect} from 'react';
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

  enum FeeGrantStatus {
    Success,
    Fail,
    Untouched
  }
  const [feeGrantStatus, setFeeGrantStatus] = useState<FeeGrantStatus>(FeeGrantStatus.Untouched);

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
  const [isFeeGranted, setIsFeeGranted] = useState<boolean>(false);

  async function grantButtonAction() {
    fetch(faucetURL, {
      method: "POST",
      body: JSON.stringify({ Address: secretAddress }),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (result) => {
        const textBody = await result.text();
        console.log(textBody);
        if (result.ok == true) {
          setFeeGrantStatus(FeeGrantStatus.Success);
          toast.success(`Successfully sent new Fee Grant!`);
        } else if (
          textBody == "Existing Fee Grant did not expire\n"
        ) {
          setFeeGrantStatus(FeeGrantStatus.Success);
          toast.success(`Using existing fee grant!`);
        } else {
          setFeeGrantStatus(FeeGrantStatus.Fail);
          toast.error(`Fee Grant failed: ${result.status}`);
        }
        setIsFeeGranted(true);
      })
      .catch((error) => {
        toast.error(
          `Fee Grant failed with error: ${error}`
        );
      });
  }

  return (
    <>
      <Discord />

      <div className="flex">
        <aside
          className={
            (showMobileMenu
              ? "z-50 left-0 right-0 w-full lg:w-auto min-h-screen "
              : "hidden lg:block") +
            " " +
            "lg:w-72 fixed left-0 top-0 h-screen p-10 overflow-x-hidden bg-zinc-900"
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
                <div className="flex items-center gap-4 m-4">
                  <div className="flex-initial lg:hidden">
                    <button
                      onClick={() => setShowMobileMenu(true)}
                      className="text-white hover:text-zinc-200 active:text-zinc-400 transition-colors"
                    >
                      <FontAwesomeIcon icon={faBars} size="lg" />
                    </button>
                  </div>

                  {/* <FeeGrant */}
                  {secretAddress && (
                    <>
                      {/* Untouched */}
                      <If condition={feeGrantStatus === FeeGrantStatus.Untouched}>
                          <button onClick={grantButtonAction} className="bg-zinc-800 px-2 py-1 text-sm rounded-md hover:bg-zinc-700 transition-colors select-none">
                            Request Fee Grant
                          </button>
                      </If>

                      {/* Success */}
                      <If condition={feeGrantStatus === FeeGrantStatus.Success}>
                        <div className="bg-zinc-800 px-2 py-1 text-sm rounded-md select-none">
                          <FontAwesomeIcon icon={faCheck} className="mr-2 text-green-500"/>
                          Fee Granted
                        </div>
                      </If>

                      {/* Fail */}
                      <If condition={feeGrantStatus === FeeGrantStatus.Fail}>
                        <Tooltip title={"Repeat request"} placement="bottom">
                          <button onClick={grantButtonAction} className="group bg-zinc-800 px-2 py-1 text-sm rounded-md select-none">
                            <FontAwesomeIcon icon={faX} className="mr-2 text-red-500"/>
                            Fee Grant failed
                            <FontAwesomeIcon icon={faRotateRight} className="ml-2 text-zinc-500 group-hover:text-white transition-colors" />
                          </button>
                        </Tooltip>
                      </If>
                    </>
                  )}

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