import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Discord } from "components/general/Discord";
import { Footer } from "components/general/Footer";
import { KeplrPanel } from "components/general/Keplr";
import { Navigation } from "components/general/navigation";
import React, { useState, createContext, useEffect } from "react";
import { SecretNetworkClient } from "secretjs";
import {faucetURL} from "utils/commons";
import { Breakpoint } from "react-socks";
import { Flip, ToastContainer, toast} from "react-toastify";

export const KeplrContext = createContext(null);
export const NavigationContext = createContext(null);
export const FeeGrantContext = createContext(null);

export const DefaultLayout = ({ children }) => {
  /**
   * Mobile Menu Handler
   */

  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024 && setShowMobileMenu) {
        setShowMobileMenu(false);
      }
    }

    window.addEventListener("resize", handleResize);
  });

  const updateFeeGrantButton = (text: string, color: string) => {
    let btnFeeGrant = document.getElementById("grantButton");
    if (btnFeeGrant != null) {
      btnFeeGrant.style.color = color;
      btnFeeGrant.textContent = text;
    }
  };

  /**
   * SecretJS & secretAddress init
   */

  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");
  const [useFeegrant, setUseFeegrant] = useState<boolean>(false);

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
            "lg:w-72 fixed left-0 top-0 h-screen p-10 overflow-x-hidden bg-zinc-800"
          }
        >
          <NavigationContext.Provider value={{ showMobileMenu }}>
            <Navigation
              showMobileMenu={showMobileMenu}
              setShowMobileMenu={setShowMobileMenu}
            />
          </NavigationContext.Provider>
        </aside>
        <KeplrContext.Provider value={{ secretjs, secretAddress }}>
          <FeeGrantContext.Provider value={{useFeegrant, setUseFeegrant}}>
            <main className="flex-1 lg:ml-72">
              {/* Keplr */}
              <div className="flex items-center gap-4 m-4">
                <div className="flex-initial lg:hidden">
                  <button
                    onClick={() => setShowMobileMenu(true)}
                    className="text-white hover:text-zinc-200 active:text-zinc-400 transition-colors">
                    <FontAwesomeIcon icon={faBars} size="lg" />
                  </button>
                </div>
                <div className="flex-1 lg:flex lg:justify-end">
                  <button

                    id="grantButton"
                    onClick={async () => {
                      fetch(faucetURL, {
                        method: "POST",
                        body: JSON.stringify({ Address: secretAddress }),
                        headers: { "Content-Type": "application/json" },
                      })
                        .then(async (result) => {
                          const textBody = await result.text();
                          console.log(textBody);
                          if (result.ok == true) {
                            updateFeeGrantButton("Fee Granted", "green");
                            toast.success(
                              `Successfully sent new fee grant (0.1 SCRT) for unwrapping tokens to address ${secretAddress}`
                            );
                          } else if (
                            textBody == "Existing Fee Grant did not expire\n"
                          ) {
                            updateFeeGrantButton("Fee Granted", "green");
                            toast.success(
                              `Your address ${secretAddress} already has an existing fee grant which will be used for unwrapping tokens`
                            );
                          } else {
                            updateFeeGrantButton("Fee Grant failed", "red");
                            toast.error(
                              `Fee Grant for address ${secretAddress} failed with status code: ${result.status}`
                            );
                          }
                          setUseFeegrant(true);
                        })
                        .catch((error) => {
                          updateFeeGrantButton("Fee Grant failed", "red");
                          toast.error(
                            `Fee Grant for address ${secretAddress} failed with error: ${error}`
                          );
                        });
                    }}
                    disabled={!secretAddress}
                  >Grant fee (0.1 SCRT)</button>
                </div>
                <KeplrPanel
                    secretjs={secretjs}
                    setSecretjs={setSecretjs}
                    secretAddress={secretAddress}
                    setSecretAddress={setSecretAddress}
                  />
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
          closeOnClick={false}
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
};

export default DefaultLayout;
