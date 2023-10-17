import {
  faArrowUpRightFromSquare,
  faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  bridgeJsonLdSchema,
  bridgePageDescription,
  bridgePageTitle,
} from "shared/utils/commons";
import { useEffect, useState, useContext } from "react";
import { trackMixPanelEvent } from "shared/utils/commons";
import SquidModal from "./SquidModal";
import { ThemeContext } from "shared/context/ThemeContext";
import HoudiniModal from "./HoudiniModal";
import { SecretjsContext } from "shared/context/SecretjsContext";
import Title from "shared/components/Title";

function Bridge() {
  useEffect(() => {
    trackMixPanelEvent("Open Bridge Tab");
  }, []);

  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isSquidModalOpen, setIsSquidModalOpen] = useState(false);
  const [isHoudiniModalOpen, setIsHoudiniModalOpen] = useState(false);

  const { secretjs, connectWallet } = useContext(SecretjsContext);

  return (
    <>
      <Helmet>
        <title>{bridgePageTitle}</title>

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="title" content={bridgePageTitle} />
        <meta name="application-name" content={bridgePageTitle} />
        <meta name="description" content={bridgePageDescription} />
        <meta name="robots" content="index,follow" />

        <meta property="og:title" content={bridgePageTitle} />
        <meta property="og:description" content={bridgePageDescription} />
        {/* <meta property="og:image" content="Image URL Here"/> */}

        <meta name="twitter:title" content={bridgePageTitle} />
        <meta name="twitter:description" content={bridgePageDescription} />
        {/* <meta name="twitter:image" content="Image URL Here"/> */}

        <script type="application/ld+json">
          {JSON.stringify(bridgeJsonLdSchema)}
        </script>
      </Helmet>
      <div className="max-w-2xl mx-auto px-6 text-neutral-600 dark:text-neutral-400 leading-7 text-justify">
        {/* Title */}
        <Title title={"Bridge"} />

        <p>
          Use the{" "}
          <a
            href="https://tunnel.scrt.network"
            target="_blank"
            className="pb-0.5 border-b border-neutral-400 dark:border-neutral-600 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors"
            onClick={() => {
              trackMixPanelEvent(
                "Clicked Secret Tunnel link (from Bridge page)"
              );
            }}
          >
            Secret Tunnel
          </a>{" "}
          to bridge your assets from blockchains such as Ethereum, Binance Smart
          Chain (BSC) and Axelar to Secret Network.
        </p>
        <a
          href="https://tunnel.scrt.network"
          target="_blank"
          className="text-white block my-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
          onClick={() => {
            trackMixPanelEvent("Clicked Secret Tunnel link (from Bridge page)");
          }}
        >
          Go to Secret Tunnel
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-2" />
        </a>
        <p>
          Alternatively, use Squid Router to bridge your assets into Secret
          Network.
          <a
            target="_blank"
            className="text-white block my-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
            onClick={() => {
              trackMixPanelEvent(
                "Clicked Squid Router Modal (from Bridge page)"
              );
              setIsSquidModalOpen(true);
            }}
          >
            Use Squid Router
          </a>
        </p>
        <SquidModal
          open={isSquidModalOpen}
          onClose={() => {
            setIsSquidModalOpen(false);
            document.body.classList.remove("overflow-hidden");
          }}
          theme={theme}
          secretAddress={secretjs?.address}
        />
        <p>
          Or anonymously bridge your assets into SCRT using Houdini Swap.
          <a
            target="_blank"
            className="text-white block my-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
            onClick={() => {
              trackMixPanelEvent(
                "Clicked Houdini Swap Modal (from Bridge page)"
              );
              setIsHoudiniModalOpen(true);
            }}
          >
            Use Houdini Swap
          </a>
        </p>
        <HoudiniModal
          open={isHoudiniModalOpen}
          onClose={() => {
            setIsHoudiniModalOpen(false);
            document.body.classList.remove("overflow-hidden");
          }}
          theme={theme}
          secretAddress={secretjs?.address}
        />
        <p>
          <span className="select-none">
            <span className="inline-block bg-emerald-500 dark:bg-green-800 text-white text-xs py-0.5 px-1.5 rounded uppercase font-semibold">
              Protip
            </span>{" "}
            –{" "}
          </span>
          If you want to bridge Axelar Assets (such as USDC, USDT) from other
          Cosmos based chains (Osmosis, Kujira) to Secret, please use the IBC
          tab:
          <Link
            to={"/ibc"}
            className="text-white block my-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
            onClick={() => {
              trackMixPanelEvent(
                "Clicked IBC transfer link (from Bridge page)"
              );
            }}
          >
            <FontAwesomeIcon icon={faShuffle} className="mr-2" />
            Go to IBC Transfers
          </Link>
        </p>
        {/*  <p>
          Use the{" "}
          <a
            href="https://ipfs.trivium.network/ipns/k51qzi5uqu5dhovcugri8aul3itkct8lvnodtnv2y3o1saotkjsa7ao1aq0dqa/"
            target="_blank"
            className="pb-0.5 border-b border-neutral-400 dark:border-neutral-600 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors"
          >
            Monero Bridge
          </a>{" "}
          to bridge your XMR from Monero to Secret Network.
          <a
            href="https://ipfs.trivium.network/ipns/k51qzi5uqu5dhovcugri8aul3itkct8lvnodtnv2y3o1saotkjsa7ao1aq0dqa/"
            target="_blank"
            className="text-white block my-6 p-3 w-full text-center font-semibold bg-cyan-600 dark:bg-cyan-600 rounded-lg text-sm hover:bg-cyan-500 dark:hover:bg-cyan-500 focus:bg-cyan-600 dark:focus:bg-cyan-600 transition-colors"
            onClick={() => {
              trackMixPanelEvent(
                "Clicked Monero Bridge link (from Bridge page)"
              );
            }}
          >
            Go to Monero Bridge
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-2" />
          </a>
        </p> */}
      </div>
    </>
  );
}

export default Bridge;
